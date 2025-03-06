// A helper function to escape regex-special characters.
function escapeRegExp(query) {
    return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// Expose the function to the global window.
window.escapeRegExp = escapeRegExp;
