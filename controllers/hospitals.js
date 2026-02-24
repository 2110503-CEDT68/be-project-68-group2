const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

// @desc     Get all hospitals
// @route    GET /api/v1/hospitals
// @access   Public
// exports.getHospitals = (req, res, next) => {
//   res.status(200).json({ success: true, msg: 'Get all hospitals' });
// }
exports.getHospitals = async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,(match) => `$${match}`);

    // finding resource
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');


    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
  try {
    const total = await Hospital.countDocuments();
    query = query.skip(startIndex).limit(limit);
    const hospitals = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc     Get single hospital
// @route    GET /api/v1/hospitals/:id
// @access   Public
// exports.getHospital = (req, res, next) => {
//   res.status(200).json({ success: true, msg: `Get hospital ${req.params.id}` });
// }
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};


// @desc     Create a hospital
// @route    POST /api/v1/hospitals
// @access   Private
exports.createHospital = async (req, res, next) => {
  //console.log(req.body);
  const hospital = await Hospital.create(req.body);
  //res.status(200).json({ success: true, msg: 'Create a hospital' });
  res.status(201).json({ success: true, data: hospital });
};


// @desc    Update single hospital
// @route   PUT /api/v1/hospitals/:id
// @access  Private
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,          // return updated doc
        runValidators: true // validate against schema on update
        // context: "query"  // ใส่เพิ่มถ้ามี custom validator ที่พึ่ง this
      }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    return res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};



// @desc     Delete single hospital
// @route    DELETE /api/v1/hospitals/:id
// @access   Private
// exports.deleteHospital = (req, res, next) => {
//   res.status(200).json({ success: true, msg: `Delete hospital ${req.params.id}` });
// }

// @desc    Delete single hospital
// @route   DELETE /api/v1/hospitals/:id
// @access  Private
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(400).json({ success: false });
    }

    await Appointment.deleteMany({ hospital: req.params.id });
    await Hospital.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};



