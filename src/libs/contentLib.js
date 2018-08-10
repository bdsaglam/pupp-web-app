import _ from "lodash";
import AnswerState from "./AnswerState";

export function isContentCompleted(content, trackRecord) {
    const answerArray = Object.values(trackRecord.answers);
    const correctAnswers = answerArray.filter(answer => (answer.state === AnswerState.CORRECT));
    return correctAnswers.length === content.questions.length;
}

export function recommendContent(contents, trackRecords) {
    let contentId;
    if (!_.isEmpty(trackRecords)) contentId = findLastViewedContent(contents, trackRecords);
    if (contentId) return contentId;

    contentId = recommentNewContent(contents, trackRecords);
    if (contentId) return contentId;

    contentId = _.sample(Object.keys(contents));
    return contentId;
}

export function findLastViewedContent(contents, trackRecords) {
    const trackRecordArray = Object.values(trackRecords);
    // sort track records from new to old
    trackRecordArray.sort((a, b) => (b.updatedAt - a.updatedAt));
    for (const tr of trackRecordArray) {
        const content = contents[tr.contentId];
        if (content && !isContentCompleted(content, tr)) {
            return content.id;
        }
    }
}

export function recommentNewContent(contents, trackRecords) {
    const contentArray = Object.values(contents);
    const watchedContentIds = _.map(trackRecords, tr => tr.contentId);
    const freshContents = contentArray.filter(content => watchedContentIds.indexOf(content.id) < 0);
    // sort contents from easy to hard
    freshContents.sort((a, b) => (a.level - b.level));
    if (freshContents) return freshContents[0].id;
}

export function getProgress({ content, trackRecord }) {
    let percent = 0;
    let status = "default";
    if (trackRecord) {
        const states = _.map(trackRecord.answers, answer => answer.state);
        const score = states.filter(s => (s === AnswerState.CORRECT)).length;
        percent = Math.floor(score / content.questions.length * 100) + 5;

        if (percent > 90) {
            status = "success";
        }
        else if (percent > 60) {
            status = "good";
        }
        else if (percent > 5) {
            status = "started";
        }
        else if (percent > 0 && trackRecord.updatedAt > trackRecord.createdAt) {
            status = "active";
        }
    }

    return { percent, status };
}
