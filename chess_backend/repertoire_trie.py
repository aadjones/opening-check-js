# repertoire_trie.py

from __future__ import annotations

from typing import Dict, List, Optional

import chess
import chess.pgn

from deviation_result import DeviationResult
from pgn_utils import walk_pgn_variations


class TrieNode:
    """Represents a single node (a position) in the repertoire trie."""

    def __init__(self, ply: int = 0, san: Optional[str] = None):
        self.ply: int = ply
        self.san: Optional[str] = san
        self.children: Dict[str, TrieNode] = {}  # Key: UCI of the move

    def __repr__(self) -> str:
        return f"TrieNode(ply={self.ply}, san={self.san!r}, children={len(self.children)})"


class RepertoireTrie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def add_move_sequence(self, board: chess.Board, moves: List[chess.Move]) -> None:
        """Adds a single, linear sequence of moves to the trie."""
        current_node = self.root
        temp_board = board.copy()

        for move in moves:
            uci = move.uci()
            child_node = current_node.children.get(uci)

            # --- THE FIX IS HERE ---
            # We must get the SAN before pushing the move
            move_san = temp_board.san(move)

            if child_node is None:
                # Use the 'move_san' variable we just created for the log message.
                print(f"[Trie] Adding new node: {move_san} (ply {temp_board.ply() + 1}) at UCI {uci}")
                child_node = TrieNode(ply=temp_board.ply() + 1, san=move_san)
                current_node.children[uci] = child_node

            # Now push the move to advance the position for the next iteration
            temp_board.push(move)
            # And traverse deeper into the trie
            current_node = child_node

    def add_study_chapter(self, chapter: chess.pgn.Game) -> None:
        print(f"[Trie] Processing chapter starting from FEN: {chapter.headers.get('FEN', 'startpos')}")
        board = chapter.board()

        sequences = list(walk_pgn_variations(chapter))
        print(f"[Trie] Found {len(sequences)} move sequences in chapter.")

        for move_sequence in sequences:
            # uci_path = " ".join([m.uci() for m in move_sequence])
            # This log can be noisy, let's keep it but be aware
            # print(f"[Trie] Adding sequence: {uci_path}")
            self.add_move_sequence(board, move_sequence)

    def find_deviation(self, recent_game: chess.pgn.Game, username: str) -> Optional[DeviationResult]:
        """
        Compares a recent game against the repertoire stored in the trie.
        Returns a DeviationResult if a deviation is found, otherwise None.
        """
        board = recent_game.board()
        my_color = "White" if username.lower() == recent_game.headers.get("White", "").lower() else "Black"
        current_trie_node = self.root

        for move in recent_game.mainline_moves():
            player_color = "White" if board.turn == chess.WHITE else "Black"
            move_number = board.fullmove_number
            board_fen_before_move = board.fen()

            if move.uci() in current_trie_node.children:
                # Move is in the repertoire, traverse deeper
                current_trie_node = current_trie_node.children[move.uci()]
                board.push(move)
            else:
                # Deviation found!
                first_deviator = "user" if player_color == my_color else "opponent"

                expected_sans = [node.san for node in current_trie_node.children.values() if node.san is not None]
                reference_san = " or ".join(sorted(expected_sans)) if expected_sans else "End of book"

                # We need all potential reference UCIs for a complete result
                reference_ucis = list(current_trie_node.children.keys())

                return DeviationResult(
                    first_deviator=first_deviator,
                    move_number=move_number,
                    deviation_san=board.san(move),
                    deviation_uci=move.uci(),
                    reference_san=reference_san,
                    reference_uci=", ".join(sorted(reference_ucis)),
                    player_color=player_color,
                    board_fen=board_fen_before_move,
                )

        # No deviation found
        return None
