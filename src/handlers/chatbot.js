const db  = require('../services/db')

module.exports = async (req, res) => {
    let data = JSON.parse(req.body);
    // console.log("🚀 ~ file: chatbot.js:5 ~ module.exports= ~ data:", data)
    let qData = req.query;
    // console.log("🚀 ~ file: chatbot.js:6 ~ module.exports= ~ qData:", qData)

    const access_token = data.token;
    const entry_id = data.entry_id;
    // console.log("🚀 ~ file: chatbot.js:8 ~ module.exports= ~ entry_id:", entry_id)

    const userLink = await db('links').where({
        'access_token': access_token
    }).first();
    // console.log("🚀 ~ file: chatbot.js:10 ~ userLink ~ userLink:", userLink)
    if(!userLink) return;

    if(userLink.expires_at < new Date()) return;

    const user = await db('users').where({
        id: userLink.user_id
    }).first()
    // console.log("🚀 ~ file: chatbot.js:16 ~ user ~ user:", user)
    if(!user) return;

    const {
        round_type,
        course,
        hole_count,
        distance,
        weather,
        par,
        total_score,
        penalty_strokes,
        sg_offtea,
        sg_approach,
        sg_around_green,
        sg_putting,
        tf_bogey_par_five,
        tf_double_bogeyp,
        tf_three_putt,
        tf_nine_iron_bogey,
        tf_blown_easy_saves,
        gs_offtee,
        gs_approach,
        gs_short_game,
        gs_putting,
        imprv_round,
        imprv_round_method,
        imprv_uncommited_shot,
        imprv_uncommited_shot_method,
        imprv_stratergic_error,
        imprv_stratergic_error_method,
        comments,
    } = data

    const journalData = {
        round_type,
        course,
        hole_count,
        distance,
        weather,
        par,
        total_score,
        penalty_strokes,
        sg_offtea,
        sg_approach,
        sg_around_green,
        sg_putting,
        tf_bogey_par_five,
        tf_double_bogeyp,
        tf_three_putt,
        tf_nine_iron_bogey,
        tf_blown_easy_saves,
        gs_offtee,
        gs_approach,
        gs_short_game,
        gs_putting,
        imprv_round,
        imprv_round_method,
        imprv_uncommited_shot,
        imprv_uncommited_shot_method,
        imprv_stratergic_error,
        imprv_stratergic_error_method,
        comments
    };

    // console.log("🚀 ~ file: chatbot.js:77 ~ module.exports= ~ journalData:", journalData)

    const existingJournal = db('journals').where({'entry_id': entry_id}).first()

    if(existingJournal) {
        await db('journals').where({'entry_id': entry_id}).update({
            user_id: user.id,
            entry_id: entry_id,
            finished: qData.finished == '1' ? 1 : 0,
            ...journalData
        })
    } else {
        await db('journals').insert({
            user_id: user.id,
            entry_id: entry_id,
            finished: 0,
            ...journalData
        })
    }

    // console.log("🚀 ~ file: chatbot.js:77 ~ module.exports= ~ journalData:", journalData)



    return res.json({ 'status': 200, 'from': 'chatbot' })
    // Get the access token from url
    // Validate the access token
    // optionally validate users subscription
    // upsert journal entry with entry_id
}