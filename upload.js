exports.wait = wait;

function wait(req, res, next) {
  if (!req.form)
    next();
  else
    req.form.complete(function(err, fields, files) {
      if (err)
        next(err);
      else {
        req.fields = fields;
        req.files = files;
        req.body = extend({}, fields, files);
        next();
      }
    });
}

function extend(target) {
  var key, obj;

  for (var i = 1, l = arguments.length; i < l; i++) {
    if ((obj = arguments[i])) {
      for (key in obj)
        target[key] = obj[key];
    }
  }

  return target;
}