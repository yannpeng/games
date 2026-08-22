"""
Automated environment setup script for the Multi-Game Arcade Platform.
Creates isolated .venv and installs dependencies (FastAPI, Uvicorn, Pydantic, Pytest).
"""

import os
import sys
import subprocess
import venv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VENV_DIR = os.path.join(BASE_DIR, ".venv")


def main():
    print("=" * 65)
    print(" 🛠️  Setting up Isolated Python Virtual Environment for Arcade...")
    print("=" * 65)

    # 1. Create venv if not exists
    if not os.path.exists(VENV_DIR):
        print("[1/3] Creating virtual environment in .venv...")
        venv.create(VENV_DIR, with_pip=True)
        print("  -> Virtual environment created.")
    else:
        print("[1/3] Existing .venv directory found. Skipping creation.")

    if sys.platform == "win32":
        venv_python = os.path.join(VENV_DIR, "Scripts", "python.exe")
    else:
        venv_python = os.path.join(VENV_DIR, "bin", "python")

    # 2. Upgrade pip and install requirements
    print("[2/3] Installing dependencies into .venv...")
    req_file = os.path.join(BASE_DIR, "requirements.txt")
    subprocess.check_call([venv_python, "-m", "pip", "install", "--upgrade", "pip", "-q"])
    subprocess.check_call([venv_python, "-m", "pip", "install", "-r", req_file, "-q"])

    print("[3/3] Dependencies successfully installed.")
    print("=" * 65)
    print(" ✅ Environment ready! You can launch the Arcade Platform by:")
    print("    - Double-clicking start.bat")
    print("    - Running: uv run python start.py")
    print("=" * 65)


if __name__ == "__main__":
    main()
