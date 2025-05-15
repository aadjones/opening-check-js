"""
This module provides utility functions for chess analysis.
"""

import os
from typing import Optional
import chess.pgn
from deviation_result import DeviationResult
from lichess_api import Study

from streamlit.logger import get_logger
logger = get_logger(__name__)


def compare_moves(
    recent_board: chess.Board,
    repertoire_board: chess.Board,
    rep_move: chess.Move,
    recent_move: chess.Move,
    player_color: str,
    my_color: str,
    whole_move_number: int,
) -> Optional[DeviationResult]:
    """
    Compares a pair of moves from recent and repertoire games, checking for deviations.

    :param recent_board: chess.Board, the chess board with the recent game's state.
    :param repertoire_board: chess.Board, the chess board with the repertoire game's state.
    :param rep_move: chess.Move, the current move from the repertoire game.
    :param recent_move: chess.Move, the current move from the recent game.
    :param player_color: str, the color of the player making the current move.
    :param my_color: str, the color the user is playing in the recent game.
    :param whole_move_number: int, the whole move number for display.
    :return: DeviationResult, or None if there's no deviation.
    """
    illegal_msg = (
        f"Illegal move: {recent_move} at position {recent_board.fen()}"
    )
    assert recent_move in recent_board.legal_moves, illegal_msg
    if (
        my_color != player_color
    ):  # If the opponent was first to deviate, return None
        return None
    deviation_san = recent_board.san(recent_move)
    reference_san = repertoire_board.san(rep_move)
    return DeviationResult(
        whole_move_number,
        deviation_san,
        reference_san,
        player_color,
        recent_board,
    )


def find_deviation(
    repertoire_game: chess.pgn.Game, recent_game: chess.pgn.Game, username: str
) -> Optional[DeviationResult]:
    """
    Compares the moves of a recent game against a repertoire game
    and finds the first move that deviates.

    :param repertoire_game: chess.pgn.Game, the opening repertoire game
    :param recent_game: chess.pgn.Game, the recent game to compare against the repertoire
    :param username: str, the name or identifier of the player
    :return: DeviationResult, or None if there's no deviation
    """
    # Initialize a board for each game to track the position
    repertoire_board = repertoire_game.board()
    recent_board = recent_game.board()
    repertoire_moves = repertoire_game.mainline_moves()
    my_game_moves = recent_game.mainline_moves()
    my_color = get_player_color(recent_game, username)

    # Iterate through moves of both games simultaneously
    moves_list = enumerate(
        zip(repertoire_moves, my_game_moves, strict=False), start=1
    )
    for half_move_number, (rep_move, recent_move) in moves_list:
        player_color = "White" if recent_board.turn else "Black"
        # Whole move count for display; move_number will be measured in ply (half-moves)
        whole_move_number = (half_move_number + 1) // 2

        # Compare moves before pushing them to the board
        if rep_move != recent_move:
            return compare_moves(
                recent_board,
                repertoire_board,
                rep_move,
                recent_move,
                player_color,
                my_color,
                whole_move_number,
            )
        # If the moves are the same, then push them to their respective boards
        recent_board.push(recent_move)
        repertoire_board.push(rep_move)

    # If we reach the end without finding a deviation, return None
    return None


def find_deviation_in_entire_study(
    study: Study, recent_game: chess.pgn.Game, username: str
) -> Optional[DeviationResult]:
    """
    Compares the moves of a recent game against a study of repertoire games, one per chapter,
    and finds the first move that deviates.

    :param study: Study, the study to find a deviation against
    :param recent_game: chess.pgn.Game, the recent game to compare against the repertoire
    :param username: str, the name or identifier of the player
    :return: DeviationResult, or None if there's no deviation
    """
    for ref_game in study.chapters:
        deviation = find_deviation(ref_game, recent_game, username)
        if deviation:
            return deviation
    return None


def find_deviation_in_entire_study_white_and_black(
    white_study: Study,
    black_study: Study,
    recent_game: chess.pgn.Game,
    username: str,
) -> Optional[DeviationResult]:
    """
    Compares the moves of a recent game against a study of repertoire games, one per chapter,
    and finds the first move that deviates.

    :param white_study: the white repertoire Study
    :param black_study: the black repertoire Study
    :param recent_game: chess.pgn.Game, the recent game to compare against the repertoire
    :param username: str, the name or identifier of the player
    :return: DeviationResult, or None if there's no deviation
    """
    player_color = get_player_color(recent_game, username)
    if player_color == "White":
        study = white_study
    elif player_color == "Black":
        study = black_study
    else:
        raise Exception(f"Could not find player {username} in provided game")

    for ref_game in study.chapters:
        deviation = find_deviation(ref_game, recent_game, username)
        if deviation:
            return deviation
    return None


def get_player_color(
    recent_game: chess.pgn.Game, player_name: str
) -> str:
    """
    Determines the color the player was playing as in a given game.

    :param recent_game: chess.pgn.Game, the game to check
    :param player_name: str, the name or identifier of the player
    :return: 'White' if the player was White, 'Black' if the player was Black, or None if no match
    """
    white_player = recent_game.headers["White"]
    black_player = recent_game.headers["Black"]

    if player_name == white_player:
        return "White"
    if player_name == black_player:
        return "Black"
    # Else:
    raise Exception(f"Could not find match {player_name} to the game!")


def write_pgn(pgn_data: str, filename: str) -> None:
    """
    Writes the PGN data to a file.

    :param pgn_data: str, the PGN data to be written to the file
    :param filename: str, the name of the file to write the PGN data to
    :return: None
    """
    full_path = os.path.join(os.getcwd(), filename)

    # Open the file in write mode (wb for binary) and write the PGN data
    with open(full_path, "wb") as f:
        f.write(pgn_data.encode())  # Convert string to bytes

    # Print confirmation message
    print(f"PGN data successfully saved to: {full_path}")


def read_pgn(pgn_file_path: str) -> chess.pgn.Game:
    """
    Reads a PGN file and returns the corresponding chess game object.

    :param pgn_file_path: str, the path to the PGN file
    :return: chess.pgn.Game, the chess game object read from the PGN file
    """
    with open(pgn_file_path, "r", encoding="utf-8") as pgn_file:
        return chess.pgn.read_game(pgn_file)
