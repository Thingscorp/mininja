#!/usr/bin/env python3
"""Unit smoke: host-config get/set/unset + server max_parallel honors file."""
from __future__ import annotations

import importlib
import importlib.util
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def load_config_cli():
    path = ROOT / "scripts" / "config.py"
    spec = importlib.util.spec_from_file_location("mininja_config_cli", path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod


def main() -> int:
    tmp = tempfile.mkdtemp(prefix="mininja-cfg-")
    os.environ["MININJA_DATA"] = tmp

    import console.paths as paths
    importlib.reload(paths)
    import console.host_config as hc
    importlib.reload(hc)
    import console.credentials as creds
    importlib.reload(creds)

    assert paths.HOST_CONFIG_PATH.parent == Path(tmp)
    assert hc.merged()["maxParallel"] == 4
    assert hc.get("defaultMode") == "auto"

    assert hc.set_value("maxParallel", 6) == 6
    assert hc.get("maxParallel") == 6
    assert hc.set_value("maxParallel", 99) == 16
    assert hc.set_value("maxParallel", 0) == 1
    hc.set_value("maxParallel", 6)

    hc.set_value("defaultMode", "draft")
    assert hc.get("defaultMode") == "draft"
    try:
        hc.set_value("defaultMode", "nope")
        raise AssertionError("bad mode should fail")
    except ValueError:
        pass

    hc.set_value("showPlants", False)
    assert hc.get("showPlants") is False
    hc.unset("showPlants")
    assert hc.get("showPlants") is True

    raw = paths.HOST_CONFIG_PATH.read_text()
    assert '"v"' in raw and "maxParallel" in raw

    import server
    importlib.reload(server)
    assert server.max_parallel() == 6
    assert server.default_mode() == "draft"

    cli = load_config_cli()
    assert cli.main(["get", "maxParallel"]) == 0
    assert cli.main(["set", "maxParallel", "8"]) == 0
    assert hc.get("maxParallel") == 8
    assert cli.main(["unset", "maxParallel"]) == 0
    assert hc.get("maxParallel") == 4
    assert cli.main(["list", "--json"]) == 0
    assert cli.main(["keys"]) == 0
    assert cli.main(["cloud"]) == 0
    assert cli.main(["path"]) == 0

    slot, err = creds.create_slot({"label": "smoke-key", "kind": "env", "provider": "xai"})
    assert err is None and slot and "secret" not in slot
    assert cli.main(["keys", "--json"]) == 0

    print("PASS  config-smoke (get/set/unset + server max_parallel)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
