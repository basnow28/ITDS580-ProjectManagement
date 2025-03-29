
exports.ok = async (req, res, next) => {
  res.status(200).json({
    response: "ok"
  });
}