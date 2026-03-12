import time
import logging
import json
from .match_list import fetch_match_list
from .parse_match import parse_match_list, transform_steam_live_data_for_predict
from database.ml_data_controller import update_matches_snapshot
from database.match_controller import add_matches, update_matches
from database.live_match_controller import update_live_matches
from database.data_for_predict_controller import update_data_for_predict, get_match_snapshots_for_predict
from LSTM_model.predict import Model

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

POLL_INTERVAL = 60


def run_collector():
    predict = Model()
    log.info("Collector started, polling every %ds", POLL_INTERVAL)

    while True:
        try:
            response = fetch_match_list()
            if not response:
                log.info("No live matches, sleeping")
                time.sleep(POLL_INTERVAL)
                continue

            matches = parse_match_list(response)

            for match, raw_match in zip(matches, response):

                if len(raw_match["players"]) < 4:
                    continue

                match_id, duration, snapshot_data = transform_steam_live_data_for_predict(raw_match)

                update_data_for_predict(match_id=match_id, snapshot=snapshot_data)

                rows = get_match_snapshots_for_predict(match_id=match_id)
                data_list = [row.data_for_predict for row in rows]

                try:
                    predict_json = predict.probs_LSTM(data_list)
                    prob_last = predict_json["all"]
                except Exception as e:
                    log.warning("Prediction failed for match %s: %s", match_id, e)
                    continue


                match["PredictRadiant"] = json.dumps(predict_json)

                update_matches_snapshot({
                    "match_id": match_id,
                    "duration": duration,
                    "full_match_data": snapshot_data,
                    "PredictRadiant": predict_json,
                })

                match["status"] = "In play"
                add_matches(match)
                match.pop("status", None)

            update_live_matches(matches)
            update_matches(matches)

        except Exception as e:
            log.exception("Collector loop error: %s", e)

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run_collector()
