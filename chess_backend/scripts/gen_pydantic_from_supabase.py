import re
from pathlib import Path

# Path to the generated TypeScript types file
SUPABASE_TS_PATH = Path(__file__).parent.parent.parent / "chess_frontend/src/types/supabase.ts"
OUTPUT_PATH = Path(__file__).parent.parent / "supabase_models.py"

# Tables to generate and their custom class names
TABLE_CLASSNAMES = {
    "opening_deviations": "OpeningDeviation",
    "profiles": "User",
}
TABLES = list(TABLE_CLASSNAMES.keys())

# TypeScript to Python type mapping
TS_TO_PY = {
    "string": "str",
    "number": "int",
    "boolean": "bool",
    "null": "None",
    "Database['public']['Enums']['review_status']": "str",  # Handle enum type
}


def ts_type_to_py(ts_type):
    # Handle union types like 'string | null'
    parts = [TS_TO_PY.get(p.strip(), "Any") for p in ts_type.split("|")]
    if "None" in parts:
        return f"Optional[{parts[0]}]"
    return parts[0]


def extract_table_fields(ts_content, table):
    # Find the Row type for the table in the Database type definition
    pattern = rf"{table}:\s*{{\s*Row:\s*{{(.*?)}};\s*Insert:"
    match = re.search(pattern, ts_content, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find Row definition for table '{table}'")

    fields_block = match.group(1)
    # Extract fields
    fields = []
    for line in fields_block.splitlines():
        line = line.strip().rstrip(",")
        if not line or ":" not in line:
            continue
        name, ts_type = line.split(":", 1)
        name = name.strip()
        ts_type = ts_type.strip()
        # Remove trailing comments and any trailing semicolons
        ts_type = ts_type.split("//")[0].strip().rstrip(";")
        py_type = ts_type_to_py(ts_type)
        fields.append((name, py_type))
    return fields


def main():
    ts_content = SUPABASE_TS_PATH.read_text()
    with open(OUTPUT_PATH, "w") as f:
        f.write("# This file is auto-generated. Do not edit by hand!\n")
        f.write("from typing import Any, Optional\n")
        f.write("from pydantic import BaseModel\n\n")

        for table in TABLES:
            try:
                fields = extract_table_fields(ts_content, table)
                class_name = TABLE_CLASSNAMES[table]
                f.write(f"class {class_name}(BaseModel):\n")
                for name, py_type in fields:
                    if py_type.startswith("Optional["):
                        f.write(f"    {name}: {py_type} = None\n")
                    else:
                        f.write(f"    {name}: Optional[{py_type}] = None\n")
                f.write("\n")
            except ValueError as e:
                print(f"Warning: {e}")
                continue
    print(f"Generated {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
