from setuptools import setup, find_packages

setup(
    name="chess_backend",
    version="0.1.0",
    packages=find_packages(where="."),
    package_dir={"": "."},
    install_requires=[
        "python-chess",
        "requests",
        "pytest",
        "pytest-mock",
    ],
    python_requires=">=3.11",
) 