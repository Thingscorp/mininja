# Coverage summary · 2026-08-17

## Phase 6

| Item | Result |
| --- | --- |
| Features in register | 37 |
| Live | 35 |
| Retired ghosts | 2 (F17 loops, F31 status) |
| Suites | 35 live |
| Unit tests | 46 passed |
| E2E | see run |
| Open high defects | 0 |
| Open medium/low | 0 (waived D07, D10, D11) |
| Confidence | 100% of live features TESTED |

## This iteration

Discovered: F37 was in the spreadsheet and missing from the JSON `qa` reads. `qa` declared the loop done anyway.

Found:
- D09 `qa F37` failed (stale JSON) — fixed
- D10 `status` is not a verb — waived, retired F31
- D11 `findLoop` is gone — waived, retired F17
- D12 unknown copy listed a stale subset — fixed (`Use help.`)
- D13 discover lines were not programs — fixed (`qa F01`)

Fixed: D09, D12, D13  
Waived: D10, D11  
Remaining risks: register and JSON can drift again if someone edits only one file.

## Decision

Stop. Do not add `status` or loops back. New work is a new program.
