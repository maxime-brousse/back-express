module.exports = function containsSQL(str) {
    const sqlKeywords = [
        "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "EXECUTE",
        "UNION", "ALL", "AND", "OR", "WHERE", "FROM", "JOIN"
    ];
    const regex = new RegExp(`\\b(${sqlKeywords.join("|")})\\b`, "i");
    return regex.test(str);
}