from match_list import fetch_match_list
from parse_match import parse_match_list, transform_steam_live_data_for_predict
from database.ml_data_controller import update_matches_snapshot
from database.match_controller import add_matches, update_matches
from database.live_match_controller import update_live_matches
from LSTM_model.predict import probs_LSTM
import time
'''
Это говно надо перепсать типа чтобы мы сейвили данные сразу в 2 таблицы одну просто с кучей снапшотов формата
match_id duration FULL_JSON (мб нет) надо думать (Я РОТ ЕЬАЛ КУЧИ ТАБЛИЦ И ВСЕ СРАЩИВАТЬ И ПАРСИТЬ((( и пердикт

ВТорая ливе матчес надо добавить поле пердикт 
  
И еще как идея реализовать залупу лупу для сохранения результатов матча 

Также надо что-то придумать с отображением хотябы базовым (типа график пердикта и че то еще надо думать блять)
PS ЩАС ФУЛЛ ХУЙНЯ 
PSPS я бля даже не уверен что нормально такой файл делать и как блять реализовывать потом обновление страницы
без ф5 ебать вопросов
'''
def run_collector():
    while True:
        # Ответ от api
        response = fetch_match_list()
        # Парсим этот ответ на live data и data for predict
        matches = parse_match_list(response)

        for match, raw_match in zip(matches, response):
            data_for_predict = transform_steam_live_data_for_predict(raw_match)
            probs = probs_LSTM(data_for_predict)
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
    run_collector()