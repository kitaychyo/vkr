from sqlalchemy.dialects.postgresql import insert

from database.models import LiveMatches
from database.db import SessionLocal

def update_live_matches(matches_list):
    """
    matches_list: список словарей с актуальными матчами, например [{'match_id': 123, ...}, ...]
    """
    current_ids = [m['match_id'] for m in matches_list]

    with SessionLocal() as session:
        # Удаляем все матчи, которых нет в текущем списке
        session.query(LiveMatches).filter(~LiveMatches.match_id.in_(current_ids)).delete(synchronize_session=False)

        # Добавляем или обновляем оставшиеся матчи
        for match_data in matches_list:
            stmt = insert(LiveMatches).values(**match_data)
            stmt = stmt.on_conflict_do_update(
                index_elements=['match_id'],
                set_=match_data  # обновляем поля если матч уже есть
            )
            session.execute(stmt)

        session.commit()


def get_all_live_matches():
    with SessionLocal() as session:
        matches = session.query(LiveMatches).all()
        # Преобразуем объекты SQLAlchemy в словари
        result = []
        for m in matches:
            result.append({
                "match_id": m.match_id,
                "duration": m.duration,
                "DireTeamName": m.DireTeamName,
                "DireTeamId": str(m.DireTeamId),  # bigint безопасно преобразуем в str
                "DireLogoTeamId": str(m.DireLogoTeamId),
                "RadiantTeamName": m.RadiantTeamName,
                "RadiantTeamId": str(m.RadiantTeamId),
                "RadiantLogoTeamId": str(m.RadiantLogoTeamId),
                "PredictRadiant": str(m.PredictRadiant),
            })
        return result

