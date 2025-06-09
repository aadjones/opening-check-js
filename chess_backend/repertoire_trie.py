# repertoire_trie.py

from __future__ import annotations
from typing import Dict, Optional
import chess
import chess.pgn

class TrieNode:
    """Represents a single node (a position) in the repertoire trie."""
    def __init__(self, ply: int = 0, san: Optional[str] = None):
        self.ply: int = ply
        self.san: Optional[str] = san
        self.children: Dict[str, TrieNode] = {} # Key: UCI of the move

    def __repr__(self) -> str:
        return f"TrieNode(ply={self.ply}, san={self.san!r}, children={len(self.children)})"
    
class RepertoireTrie:
    """A Trie data structure to store and query chess opening repertoires."""
    def __init__(self):
        self.root = TrieNode()

    def add_study_chapter(self, chapter: chess.pgn.Game):
        """Adds a full chess game, including variations, to the trie."""
        # For now, we only handle the mainline.
        if not chapter.is_end():
            self._add_node_recursive(chapter.variation(0), self.root)

    def _add_node_recursive(self, game_node: chess.pgn.GameNode, trie_node: TrieNode):
        """Recursively traverses game nodes and adds them to the trie."""
        move = game_node.move
        if move is None:
            return

        # Create the child node for this move. We don't handle existing nodes yet.
        child_trie_node = TrieNode(ply=game_node.ply(), san=game_node.san())
        trie_node.children[move.uci()] = child_trie_node

        # Recurse for the main line
        if not game_node.is_end():
            self._add_node_recursive(game_node.variation(0), child_trie_node)