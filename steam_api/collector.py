from .match_list import fetch_match_list
from .parse_match import parse_match_list, transform_steam_live_data_for_predict
from database.ml_data_controller import update_matches_snapshot
from database.match_controller import add_matches, update_matches
from database.live_match_controller import update_live_matches
from LSTM_model.predict import Model
from database.data_for_predict_controller import update_data_for_predict, get_match_snapshots_for_predict
import time
import asyncio
'''
Это говно надо перепсать типа чтобы мы сейвили данные сразу в 2 таблицы одну просто с кучей снапшотов формата
match_id duration FULL_JSON (мб нет) надо думать (Я РОТ ЕЬАЛ КУЧИ ТАБЛИЦ И ВСЕ СРАЩИВАТЬ И ПАРСИТЬ((( и пердикт

ВТорая ливе матчес надо добавить поле пердикт 
  
И еще как идея реализовать залупу лупу для сохранения результатов матча 

Также надо что-то придумать с отображением хотябы базовым (типа график пердикта и че то еще надо думать блять)
PS ЩАС ФУЛЛ ХУЙНЯ 

'''
def run_collector():
    predict = Model()
    while True:
        # Ответ от api
        response = fetch_match_list()
        # Парсим этот ответ на live data и data for predict
        matches = parse_match_list(response)

        for match, raw_match in zip(matches, response):
            data_for_predict = transform_steam_live_data_for_predict(raw_match)
            update_data_for_predict(match_id = data_for_predict[0], snapshot=data_for_predict[2])

            rows = get_match_snapshots_for_predict(match_id = data_for_predict[0])
            full_data_for_predict = {
                "data_for_predict": [row.data_for_predict for row in rows]
            }
            probs = float(predict.probs_LSTM(full_data_for_predict["data_for_predict"]))


            match["PredictRadiant"] = probs
            match_snapshot = {
                "match_id": data_for_predict[0],
                "duration": data_for_predict[1],
                "full_match_data": data_for_predict[2],
                "predict_radiant": probs,
            }
            update_matches_snapshot(match_snapshot) # добавляем снопшот матча в таблицу В итоге там будет просто куча снапшотов матчей
            match["status"] = "In play"
            add_matches(match)
            match.pop("status", None)

        '''
        Сохраняем live матчи в отдельную таблицу
        '''
        update_live_matches(matches)
        update_matches(matches)
        time.sleep(30)

if __name__ == "__main__":
    asyncio.run(run_collector())