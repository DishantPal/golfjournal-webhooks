module.exports = async (req,res) => {
    return res.json({'status': 200, 'from': 'chatbot'})
    // Get the access token from url
    // Validate the access token
    // optionally validate users subscription
    // upsert journal entry with entry_id
}