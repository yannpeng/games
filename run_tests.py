"""
Automated test runner for the Cyberpunk Arcade Platform.
Runs test suites across Auth, Multi-Game Scores, and Hub routing.
"""

import sys
import pytest

if __name__ == "__main__":
    print("Running automated test suite for Arcade Platform...")
    exit_code = pytest.main(["-v", "tests/"])
    sys.exit(exit_code)
