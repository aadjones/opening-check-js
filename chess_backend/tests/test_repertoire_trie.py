# tests/test_repertoire_trie.py
import pytest

from deviation_result import DeviationResult
from pgn_utils import pgn_string_to_game
from repertoire_trie import RepertoireTrie, TrieNode


def test_trie_node_initialization() -> None:
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


def test_add_simple_mainline() -> None:
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
    assert len(node_nc6.children) == 0  # No more moves


def test_add_game_with_variations() -> None:
    """Tests that sidelines are correctly added as separate branches."""
    # 1. e4 has two responses: e5 (main) and c5 (sideline)
    pgn = "1. e4 (1. d4 d5) e5 2. Nf3 (2. f4) Nc6"
    game = pgn_string_to_game(pgn)
    trie = RepertoireTrie()
    trie.add_study_chapter(game)

    # Assert root has two branches: e4 and d4
    assert len(trie.root.children) == 2
    assert "e2e4" in trie.root.children
    assert "d2d4" in trie.root.children

    # Check the d4 branch
    node_d4 = trie.root.children["d2d4"]
    assert "d7d5" in node_d4.children

    # Check the e4 branch
    node_e4 = trie.root.children["e2e4"]
    assert "e7e5" in node_e4.children
    node_e5 = node_e4.children["e7e5"]

    # After 1...e5, white has two options: Nf3 and f4
    assert len(node_e5.children) == 2
    assert "g1f3" in node_e5.children
    assert "f2f4" in node_e5.children


@pytest.fixture
def sample_trie() -> RepertoireTrie:
    """Provides a sample trie for testing deviation logic."""
    print("\n--- BUILDING SAMPLE TRIE FIXTURE ---")
    trie = RepertoireTrie()

    # --- Chapter 1 ---
    repertoire_pgn_1 = """
[Event "White Repertoire"]

1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bb5 a6 (3... Nf6) *
"""
    print("\n[Fixture] Parsing Chapter 1 PGN...")
    chapter1 = pgn_string_to_game(repertoire_pgn_1)
    print(f"[Fixture] Chapter 1 Parsed. Mainline moves: {list(chapter1.mainline_moves())}")
    print("[Fixture] Adding Chapter 1 to trie...")
    trie.add_study_chapter(chapter1)

    # --- Chapter 2 ---
    repertoire_pgn_2 = """
[Event "White Repertoire"]

1. e4 c5 2. Nc3 *
"""
    print("\n[Fixture] Parsing Chapter 2 PGN...")
    chapter2 = pgn_string_to_game(repertoire_pgn_2)
    print(f"[Fixture] Chapter 2 Parsed. Mainline moves: {list(chapter2.mainline_moves())}")
    print("[Fixture] Adding Chapter 2 to trie...")
    trie.add_study_chapter(chapter2)

    print(f"\n[Fixture] TRIE BUILT. Root has {len(trie.root.children)} children.")
    if trie.root.children:
        print(f"[Fixture] Root children keys: {list(trie.root.children.keys())}")
    print("--- FINISHED BUILDING SAMPLE TRIE ---\n")
    return trie


def test_find_deviation_no_deviation(sample_trie: RepertoireTrie) -> None:
    """Game follows the repertoire perfectly."""
    game_pgn = '[White "user_test"]\n[Black "opponent"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5'
    game = pgn_string_to_game(game_pgn)
    result = sample_trie.find_deviation(game, "user_test")
    assert result is None


def test_find_deviation_by_user(sample_trie: RepertoireTrie) -> None:
    """User (White) deviates from the repertoire."""
    # User plays 3. d4 (Scotch) instead of 3. Bb5 (Ruy Lopez)
    game_pgn = '[White "user_test"]\n[Black "opponent"]\n\n1. e4 e5 2. Nf3 Nc6 3. d4'
    game = pgn_string_to_game(game_pgn)
    result = sample_trie.find_deviation(game, "user_test")

    assert isinstance(result, DeviationResult)
    assert result.first_deviator == "user"
    assert result.move_number == 3
    assert result.deviation_san == "d4"
    assert result.player_color == "White"
    assert "Bb5" in result.reference_san  # The main prep move


def test_find_deviation_by_opponent(sample_trie: RepertoireTrie) -> None:
    """Opponent (Black) deviates from the repertoire."""
    # Opponent plays 2... Nf6 instead of 2... Nc6 or 2... d6
    game_pgn = '[White "user_test"]\n[Black "opponent"]\n\n1. e4 e5 2. Nf3 Nf6'
    game = pgn_string_to_game(game_pgn)
    result = sample_trie.find_deviation(game, "user_test")

    assert isinstance(result, DeviationResult)
    assert result.first_deviator == "opponent"
    assert result.move_number == 2
    assert result.deviation_san == "Nf6"
    assert result.player_color == "Black"
    assert "Nc6" in result.reference_san
    assert "d6" in result.reference_san
