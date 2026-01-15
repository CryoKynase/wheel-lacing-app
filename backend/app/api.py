from datetime import datetime
import textwrap

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.compute.schraner import compute_pattern
from app.db import get_session
from app.models import PatternRequest, PatternResponse
from app.presets import (
    Preset,
    PresetCreate,
    PresetDetail,
    PresetSummary,
    PresetUpdate,
    preset_to_detail,
)

router = APIRouter(prefix="/api")


@router.post("/pattern/compute", response_model=PatternResponse)
def compute_pattern_endpoint(req: PatternRequest) -> PatternResponse:
    return compute_pattern(req)


@router.get("/readme")
def readme() -> dict:
    markdown = textwrap.dedent(
        """\
        # Wheel Weaver Guide
        **Schraner workshop method - written for the bench**

        Wheel Weaver generates a **step-by-step lacing table** and a matching
        **diagram/flowchart** using the Schraner workshop sequence:

        **R1 -> R2 -> R3 -> L1 -> L3 -> L4**

        Follow the **Order** column from top to bottom and you will always place the
        next spoke into the correct **hub hole**, **rim hole**, and **head orientation**.

        ---

        ## Quick start (bench workflow)

        1. Choose **Rim Holes** from the top bar (20/24/28/32/36H).
        2. Set **Wheel type** and **Crosses** (e.g. 32H rear 3x).
        3. Use **Next step mode** in the table to work phase-by-phase.
        4. Start at **R1** and place the two **reference spokes at the valve**.
        5. Step through **R2** and **R3** on DS (odd fill then even weave).
        6. Flip the wheel and repeat **L1 -> L3 -> L4** on NDS.
        7. Use **Print view** for a paper bench guide or **Export/Copy CSV** for records.

        **Row rule:** Hub hole -> Heads IN/OUT -> Rim hole -> a few nipple turns.

        ---

        ## Orientation (prevents most confusion)

        Everything is described **as if you are looking at the wheel from the DS
        (drive side) viewpoint**. "Clockwise" means clockwise from the DS view.

        ### DS / NDS
        - Rear: DS = cassette side, NDS = opposite flange
        - Front: still uses DS/NDS labels; rotor side is treated as NDS

        ### Valve left / right
        - Valve is at **12 o'clock**
        - **Right of valve** = clockwise (top-right)
        - **Left of valve** = counter-clockwise (top-left)

        ### Heads OUT / IN
        - **OUT**: spoke head on the **outside** of the flange (outside -> inside)
        - **IN**: spoke head on the **inside** of the flange (inside -> outside)

        ---

        ## Rim numbering (exactly how the app numbers holes)

        - Valve is at 12 o'clock
        - Rim holes are numbered **clockwise** from the DS viewpoint
        - **Hole 1** is the first hole clockwise from the valve
        - **Hole N** is immediately counter-clockwise from the valve
        - Wrap-around applies: **N sits next to 1** at the valve

        Practical tip:
        - Put tape at the valve.
        - The hole just to the right is **1**.
        - The hole just to the left is **N**.

        ---

        ## Hub numbering (exactly how the app counts flange holes)

        Let:
        - **N** = total holes (e.g. 32)
        - **H** = holes per flange = **N/2** (e.g. 16)

        Each flange is numbered **1..H clockwise as you look directly at that flange**.

        If your hub has no reference mark:
        - Pick any physical hole as "1".
        - If your hub has a readable band name on it, conventon states that the rider
        - when seated on the bike should be able to read the label so it reads from NDS to DS.
        - Use **Start hub hole (DS/NDS)** to rotate the pattern to match your build.

        ---

        ## Builder page (main workspace)

        The Builder recalculates automatically as you change parameters.

        ### Parameters panel
        - **Basics:** wheel type, crosses, symmetry, invert heads
        - **Starts:** start rim hole, start hub hole DS/NDS
        - **Valve:** valve reference (right/left of valve)
        - **Filters:** DS/NDS filter for the table + diagram
        - **Reset defaults:** restores the default pattern (32H rear 3x)

        **Valve clearance:** a "Valve area looks clear" indicator appears when the
        termination pattern around the valve is open. In **Print view**, a badge
        shows either clear or crowded.

        ### Table view
        - **Full table** shows every row; **Compact lookup** is mobile-friendly and
          lets you query by rim hole, hub hole, or spoke/order.
        - **Step filter buttons** (R1/R2/R3/L1/L3/L4) let you isolate phases.
        - **Next step mode** shows one Schraner step at a time (Prev/Next controls).
        - **Highlight mode** controls what lights up in the diagram.
        - **Actions menu** (top-right of the table card):
          - Copy visible rows as CSV
          - Copy all rows as CSV
          - Download CSV
          - Print
        - **Export CSV** inside the table header exports the currently visible rows
          and columns (respects filters and column visibility).

        Hover any row to highlight the corresponding spoke in the diagram.

        ### Diagram view
        - Use it to verify valve clearance and spoke routing.
        - Hover rows in the table to highlight spokes here.
        - DS/NDS filter limits which spokes render.

        ### Print view
        - Forces the table view and adds a parameter summary.
        - Intended for a clean bench reference.

        ---

        ## Flow page

        The Flow page generates a **flowchart-style SVG** for the same pattern.

        - Uses the same **Parameters panel** and DS/NDS filter.
        - **Zoom in/out** buttons adjust the chart scale.
        - **Open Print View** opens a clean, print-ready tab.
        - **Download SVG** saves the diagram for notes or sharing.

        ---

        ## Presets

        - **Save as...** stores the current parameters.
        - **Update preset** appears when you modify a selected preset.
        - **Delete** removes it (with confirmation).

        Presets are stored in the local backend database
        (`backend/app/db.sqlite` by default).

        ---

        ## Settings

        - **Accent color** controls subtle highlight colors.
        - **Table columns** lets you show/hide specific columns.

        ---

        ## Keyboard shortcuts (Builder)

        - `/` focus the first parameter field
        - `t` table tab
        - `d` diagram tab
        - `b` both tab
        - `p` toggle print view

        ---

        ## Worked example (32H rear 3x)

        Common defaults:
        - Holes: 32
        - Wheel: rear
        - Crosses: 3x
        - Symmetry: symmetrical
        - Start rim hole: 1
        - Valve reference: right of valve
        - Start hub hole DS/NDS: 1

        In **Step R1**, the first two DS spokes should straddle the valve:
        - One lands in **rim hole N (32)** = valve-left
        - One lands in **rim hole 1** = valve-right

        That is correct and anchors the rest of the lacing.

        ---

        ## Troubleshooting

        - **Spokes do not drop naturally into rim holes**
          - Usually off by one at the valve, or starting at a different hub hole.
          - Adjust **Start hub hole (DS)** by +/-1 and check again.
        - **Valve area looks crowded**
          - Confirm the R1 pair straddles **N and 1** at the valve.
          - Try switching **Valve reference** or adjust **Start rim hole**.
        - **Diagram looks busy**
          - Use **Next step mode** or step filters.
          - Use DS/NDS filter to isolate one side.
        - **Front wheel DS/NDS confusion**
          - Treat the **rotor side as NDS** in this app.

        ---

        ## Safety and sanity

        - Thread nipples only a few turns during lacing (no tension yet).
        - Keep the DS viewpoint in mind when thinking clockwise.
        - If anything feels forced, stop and re-check **R1** first.
        """
    ).strip()
    return {"markdown": markdown}


@router.get("/presets", response_model=list[PresetSummary])
def list_presets(session: Session = Depends(get_session)) -> list[PresetSummary]:
    presets = session.exec(select(Preset).order_by(Preset.updatedAt.desc())).all()
    return [
        PresetSummary(
            id=preset.id,
            name=preset.name,
            holes=preset.holes,
            wheelType=preset.wheelType,
            crosses=preset.crosses,
            symmetry=preset.symmetry,
            updatedAt=preset.updatedAt,
        )
        for preset in presets
    ]


@router.post("/presets", response_model=PresetDetail)
def create_preset(
    payload: PresetCreate, session: Session = Depends(get_session)
) -> PresetDetail:
    params = payload.params
    preset = Preset(
        name=payload.name,
        holes=params.holes,
        wheelType=params.wheelType,
        crosses=params.crosses,
        symmetry=params.symmetry,
        invertHeads=params.invertHeads,
        startRimHole=params.startRimHole,
        valveReference=params.valveReference,
        startHubHoleDS=params.startHubHoleDS,
        startHubHoleNDS=params.startHubHoleNDS,
    )
    session.add(preset)
    session.commit()
    session.refresh(preset)
    return preset_to_detail(preset)


@router.get("/presets/{preset_id}", response_model=PresetDetail)
def get_preset(
    preset_id: str, session: Session = Depends(get_session)
) -> PresetDetail:
    preset = session.get(Preset, preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    return preset_to_detail(preset)


@router.put("/presets/{preset_id}", response_model=PresetDetail)
def update_preset(
    preset_id: str,
    payload: PresetUpdate,
    session: Session = Depends(get_session),
) -> PresetDetail:
    preset = session.get(Preset, preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    if payload.name is not None:
        preset.name = payload.name
    if payload.params is not None:
        params = payload.params
        preset.holes = params.holes
        preset.wheelType = params.wheelType
        preset.crosses = params.crosses
        preset.symmetry = params.symmetry
        preset.invertHeads = params.invertHeads
        preset.startRimHole = params.startRimHole
        preset.valveReference = params.valveReference
        preset.startHubHoleDS = params.startHubHoleDS
        preset.startHubHoleNDS = params.startHubHoleNDS
    preset.updatedAt = datetime.utcnow()
    session.add(preset)
    session.commit()
    session.refresh(preset)
    return preset_to_detail(preset)


@router.delete("/presets/{preset_id}")
def delete_preset(
    preset_id: str, session: Session = Depends(get_session)
) -> dict:
    preset = session.get(Preset, preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    session.delete(preset)
    session.commit()
    return {"ok": True}
