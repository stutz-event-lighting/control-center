module.exports = function (db) {
  db.Pin = db.model("pins", {
    name: String,
    pin: String,
    full: Boolean,
    rules: [
      {
        from: Number,
        to: Number,
        days: [Number],
        timeFrom: Number,
        timeTo: Number,
      },
    ],
  });
};
