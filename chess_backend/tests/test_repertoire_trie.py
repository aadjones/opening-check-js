# tests/test_repertoire_trie.py
from repertoire_trie import TrieNode, RepertoireTrie
import io
import chess.pgn
from pgn_utils import pgn_string_to_game

def test_trie_node_initialization():
    """Tests that a TrieNode can be created with default and custom values."""
    # Test default initialization
    node = TrieNode()
    assert node.ply == 0
    assert node.san is None
    assert node.children == {}

    # Test initialization with values
    node = TrieNode(ply=1, san="e4")
    assert node.ply == 1
    assert node.san == "e4"
    assert node.children == {}

def test_add_simple_mainline():
    """Tests adding a single game with no variations."""
    pgn = "1. e4 e5 2. Nf3 Nc6"
    game = pgn_string_to_game(pgn)
    trie = RepertoireTrie()
    trie.add_study_chapter(game)

    # Assert the trie structure
    # 1. e4
    assert len(trie.root.children) == 1
    assert "e2e4" in trie.root.children
    node_e4 = trie.root.children["e2e4"]
    assert node_e4.san == "e4"
    assert node_e4.ply == 1

    # 1... e5
    assert len(node_e4.children) == 1
    assert "e7e5" in node_e4.children
    node_e5 = node_e4.children["e7e5"]
    assert node_e5.san == "e5"
    assert node_e5.ply == 2

    # 2. Nf3
    assert len(node_e5.children) == 1
    assert "g1f3" in node_e5.children
    node_nf3 = node_e5.children["g1f3"]
    assert node_nf3.san == "Nf3"
    assert node_nf3.ply == 3

    # 2... Nc6 (end of the line)
    assert len(node_nf3.children) == 1
    assert "b8c6" in node_nf3.children
    node_nc6 = node_nf3.children["b8c6"]
    assert node_nc6.san == "Nc6"
    assert node_nc6.ply == 4
    assert len(node_nc6.children) == 0 # No more moves