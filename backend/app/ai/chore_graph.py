"""
LangGraph scaffold for AI-powered chore generation and point assignment.

This is a minimal, provider-agnostic pipeline placeholder that you can hook up to your
LLM provider (e.g., OpenAI) via LangGraph / LangChain later. For now it returns
deterministic suggestions based on age bands and difficulty heuristics.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional
from datetime import date


@dataclass
class ChoreSuggestion:
    title: str
    description: str
    emoji: str
    point_value: int
    assigned_to: Optional[int] = None


def suggest_for_age(age: int) -> List[ChoreSuggestion]:
    # Simple heuristic rules; replace with LangGraph later
    if age <= 6:
        return [
            ChoreSuggestion("Put toys away", "Tidy toys into bins", "🧸", 2),
            ChoreSuggestion("Make bed", "Straighten sheets and pillows", "🛏️", 3),
            ChoreSuggestion("Feed pet", "Put food in bowl", "🐶", 2),
        ]
    elif age <= 10:
        return [
            ChoreSuggestion("Set the table", "Prepare utensils and plates", "🍽️", 3),
            ChoreSuggestion("Sweep floor", "Light sweep in living room", "🧹", 4),
            ChoreSuggestion("Water plants", "Water indoor plants", "🪴", 2),
        ]
    else:
        return [
            ChoreSuggestion("Vacuum room", "Vacuum bedroom/carpet", "🧼", 5),
            ChoreSuggestion("Take out trash", "Collect and take trash out", "🗑️", 4),
            ChoreSuggestion("Dishes", "Load/unload dishwasher", "🍽️", 5),
        ]


def generate_weekly_chores(
    family_id: int,
    week_start: date,
    ages_by_user: dict[int, int] | None = None,
    max_per_child: int = 3,
) -> List[ChoreSuggestion]:
    """
    Deterministic chore suggestions for development.
    Later, replace with LangGraph nodes:
      - input node (context: ages, past chores/completions)
      - planner node (LLM)
      - scorer node (LLM or rules)
      - output node to ChoreSuggestion list
    """
    suggestions: List[ChoreSuggestion] = []
    if not ages_by_user:
        # Fallback suggestions unassigned
        suggestions.extend(
            [
                ChoreSuggestion("Clean Room", "Tidy room and make bed", "🧹", 5),
                ChoreSuggestion("Feed Pet", "Fill pet bowl", "🐶", 2),
                ChoreSuggestion("Help with Laundry", "Fold small items", "🧺", 3),
            ]
        )
        return suggestions

    for user_id, age in ages_by_user.items():
        picks = suggest_for_age(age)[:max_per_child]
        for p in picks:
            suggestions.append(
                ChoreSuggestion(
                    title=p.title,
                    description=p.description,
                    emoji=p.emoji,
                    point_value=p.point_value,
                    assigned_to=user_id,
                )
            )
    return suggestions