const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (obj && typeof obj === 'object') {
    const cleanObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const cleanKey = key.replace(/[$.]/g, '');
        let value = obj[key];
        if (typeof value === 'string') {
          value = value.replace(/<[^>]*>?/gm, '');
        }
        cleanObj[cleanKey] = sanitizeObject(value);
      }
    }
    return cleanObj;
  }
  return obj;
};

module.exports = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};