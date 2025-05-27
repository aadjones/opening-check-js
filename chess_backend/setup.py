from setuptools import find_packages, setup

setup(
    name="chess_backend",
    version="0.1.0",
    packages=find_packages(where="."),
    package_dir={"": "."},
    install_requires=[
        "fastapi",
        "uvicorn",
        "pydantic",
        "requests",
        "python-chess",
        "pytest",
        "pytest-mock",
        "supabase",
        "python-dotenv",
        "httpx",
        "black",
        "isort",
        "flake8",
        "mypy",
        "types-requests",
        "types-setuptools",
    ],
    python_requires=">=3.11",
)
