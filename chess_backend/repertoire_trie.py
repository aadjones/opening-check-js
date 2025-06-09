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
        """
        Adds a full chess game, including all variations, to the trie.
        A 'chapter' from a Lichess study is represented as a chess.pgn.Game.
        """
        # The chapter itself is the root of its own move tree.
        # We iterate through its variations (the first moves of the chapter).
        for initial_variation_node in chapter.variations:
            self._add_node_recursive(initial_variation_node, self.root)

    def _add_node_recursive(self, game_node: chess.pgn.GameNode, trie_node: TrieNode):
        """Recursively traverses game nodes and adds them to the trie."""
        move = game_node.move
        if move is None:
            return

        # Find OR CREATE the child node for this move
        child_trie_node = trie_node.children.get(move.uci())
        if child_trie_node is None:
            child_trie_node = TrieNode(ply=game_node.ply(), san=game_node.san())
            trie_node.children[move.uci()] = child_trie_node

        # THE FIX IS HERE:
        # Instead of using num_variations and indexing, we iterate directly
        # over the .variations property. This works for both Game and ChildNode.
        for next_variation_node in game_node.variations:
            self._add_node_recursive(next_variation_node, child_trie_node)
