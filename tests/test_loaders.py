import os
import tempfile

import pytest

from app.loaders.pdf_loader import load_pdf
from app.loaders.document_loader import load_all_documents


def test_load_pdf_missing_file():
    """load_pdf should return an empty list for a non-existent file."""
    result = load_pdf("/non/existent/file.pdf")
    assert result == []


def test_load_all_documents_empty_directory():
    """load_all_documents should return an empty list for an empty directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        result = load_all_documents(tmpdir)
        assert result == []


def test_load_all_documents_skips_unsupported_files():
    """load_all_documents should skip files with unsupported extensions."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create a .txt file (unsupported)
        txt_path = os.path.join(tmpdir, "notes.txt")
        with open(txt_path, "w") as f:
            f.write("This is a text file.")

        result = load_all_documents(tmpdir)
        assert result == []


def test_load_all_documents_nonexistent_directory():
    """load_all_documents should return an empty list for a missing directory."""
    result = load_all_documents("/nonexistent/directory")
    assert result == []
