import ast
import json
import sys


def constant_only(node):
    return all(isinstance(n, (ast.Expression, ast.Constant, ast.BinOp, ast.UnaryOp, ast.Tuple, ast.List, ast.operator, ast.unaryop, ast.Load)) for n in ast.walk(node))


def literal(node):
    try:
        return ast.literal_eval(node)
    except Exception:
        pass
    if constant_only(node):
        try:
            return eval(compile(ast.Expression(node), "<anchor>", "eval"), {"__builtins__": {}}, {})
        except Exception:
            return None
    return None


def symbols_of(source):
    tree = ast.parse(source)
    found = {}
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            found.setdefault(node.name, {"kind": "def", "line": node.lineno, "end": node.end_lineno})
        elif isinstance(node, (ast.Assign, ast.AnnAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            for target in targets:
                if isinstance(target, ast.Name) and node.value is not None:
                    found.setdefault(target.id, {"kind": "value", "line": node.lineno, "end": node.end_lineno, "value": literal(node.value), "valueStart": [node.value.lineno, node.value.col_offset], "valueEnd": [node.value.end_lineno, node.value.end_col_offset]})
    strings = sorted({n.value for n in ast.walk(tree) if isinstance(n, ast.Constant) and isinstance(n.value, str) and len(n.value) < 200})
    names = sorted({n.id for n in ast.walk(tree) if isinstance(n, ast.Name)} | {n.arg for n in ast.walk(tree) if isinstance(n, (ast.arg, ast.keyword)) and n.arg} | {n.attr for n in ast.walk(tree) if isinstance(n, ast.Attribute)})
    return {"symbols": found, "strings": strings, "names": names}


if __name__ == "__main__":
    out = {}
    for path in sys.argv[1:]:
        with open(path, encoding="utf8") as handle:
            out[path] = symbols_of(handle.read())
    sys.stdout.write(json.dumps(out, default=str))
