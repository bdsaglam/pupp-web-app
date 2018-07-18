import { API } from "aws-amplify";

import {
    FETCH_TRACKRECORDS, FETCH_TRACKRECORD,
    CREATE_TRACKRECORD, UPDATE_TRACKRECORD, DELETE_TRACKRECORD
} from "./types";

export function fetchTrackRecords() {
    const request = API.get(
        "TrackRecordsAPI",
        "/trackrecords"
    );

    return (dispatch) => {
        request.then(response => {
            dispatch({ type: FETCH_TRACKRECORDS, payload: response });
        }).catch(error => {
            console.log(error.response);
        });
    };
}

export function fetchTrackRecord(contentId) {
    const request = API.get(
        "TrackRecordsAPI",
        `/trackrecords/${contentId}`
    );

    return (dispatch) => {
        request.then(response => {
            dispatch({ type: FETCH_TRACKRECORD, payload: response });
        }).catch(error => {
            console.log(error.response);
            if (error.response && error.response.status === 404) {
                console.log("fetchTrackRecord 404");
                const trackRecord = { contentId: contentId, answers: {} };
                createTrackRecord(trackRecord);
            }

        });
    };
}

export function createTrackRecord(trackRecord) {
    const request = API.post(
        "TrackRecordsAPI",
        `/trackrecords/${trackRecord.contentId}`,
        { body: trackRecord }
    );

    return (dispatch) => {
        request.then(response => {
            console.log("createTrackRecord success", response);
            dispatch({ type: CREATE_TRACKRECORD, payload: trackRecord });
        }).catch(error => {
            console.log(error.response);
        });
    };
}

export function updateTrackRecord(trackRecord) {
    const request = API.put(
        "TrackRecordsAPI",
        `/trackrecords/${trackRecord.contentId}`,
        { body: trackRecord }
    );

    return (dispatch) => {
        request.then(response => {
            console.log("updateTrackRecord success", response);
            dispatch({ type: UPDATE_TRACKRECORD, payload: trackRecord });
        }).catch(error => {
            console.log(error.response);
        });
    };
}

export function deleteTrackRecord(contentId) {
    const request = API.del(
        "TrackRecordsAPI",
        `/trackrecords/${contentId}`
    );

    return (dispatch) => {
        request.then(response => {
            console.log("deleteTrackRecord success", response);
            dispatch({ type: DELETE_TRACKRECORD, payload: { contentId: contentId } });
        }).catch(error => {
            console.log(error.response);
        });
    };
}