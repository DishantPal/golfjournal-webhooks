const db = require('../services/db')
const knex = require('knex')

module.exports = async (req, res) => {
  let data = JSON.parse(req.body)

  let qData = req.query

  const access_token = data.token
  const entry_id = data.entry_id

  const userLink = await db('links')
    .where({
      access_token: access_token
    })
    .first()
  if (!userLink) return

  if (userLink.expires_at < new Date()) return

  const user = await db('users')
    .where({
      id: userLink.user_id
    })
    .first()
  if (!user) return

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
    comments
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
  }

  const entryDate = data['date']

  // journalData['date'] = new Date(Date.now() - 86400000) => This will give issue for the timezone, so use db date functions
  journalData['date'] = new Date()
  if (entryDate == 'Yesterday') {
    journalData['date'] = db.raw("DATE_SUB(CURDATE(), INTERVAL 1 DAY)")
  }
  else if (entryDate == 'Today') {
    journalData['date'] = db.raw("CURDATE()")
  }
  else {
    let parsedDate = new Date(entryDate)
    journalData['date'] = parsedDate
  }
  

  console.log("🚀 ~ file: chatbot.js:92 ~ module.exports= ~ journalData:", journalData)

  const existingJournal = await db('journals')
    .where({ entry_id: entry_id })
    .first()

  if (existingJournal) {
    await db('journals')
      .where({ entry_id: entry_id })
      .update({
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

  return res.json({ status: 200, from: 'chatbot' })
}
