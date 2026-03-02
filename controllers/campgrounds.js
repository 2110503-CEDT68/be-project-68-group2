const mongoose = require('mongoose');
const Campground = require('../models/Campground');
const Booking = require('../models/Booking');

// @desc     Get all Campgrounds
// @route    GET /api/v1/Campgrounds
// @access   Public
// exports.getCampgrounds = (req, res, next) => {
//   res.status(200).json({ success: true, msg: 'Get all campgrounds' });
// }
exports.getCampgrounds = async (req, res, next) => {
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
    query = Campground.find(JSON.parse(queryStr));


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
    const total = await Campground.countDocuments();
    query = query.skip(startIndex).limit(limit);
    const campgrounds = await query;

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
    res.status(200).json({ success: true, count: campgrounds.length, data: campgrounds });
  } catch (err) {
    console.error("getCampgrounds error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// @desc     Get single campground
// @route    GET /api/v1/campgrounds/:id
// @access   Public
// exports.getCampground = (req, res, next) => {
//   res.status(200).json({ success: true, msg: `Get campground ${req.params.id}` });
// }
exports.getCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};


// @desc     Create a campground
// @route    POST /api/v1/campgrounds
// @access   Private
exports.createCampground = async (req, res, next) => {
  //console.log(req.body);
  const campground = await Campground.create(req.body);
  //res.status(200).json({ success: true, msg: 'Create a campground' });
  res.status(201).json({ success: true, data: campground });
};


// @desc    Update single campground
// @route   PUT /api/v1/campgrounds/:id
// @access  Private
exports.updateCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,          // return updated doc
        runValidators: true // validate against schema on update
        // context: "query"  // ใส่เพิ่มถ้ามี custom validator ที่พึ่ง this
      }
    );

    if (!campground) {
      return res.status(404).json({ success: false, message: "Campground not found" });
    }

    return res.status(200).json({ success: true, data: campground });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};



// @desc     Delete single campground
// @route    DELETE /api/v1/campgrounds/:id
// @access   Private
// exports.deleteCampground = (req, res, next) => {
//   res.status(200).json({ success: true, msg: `Delete campground ${req.params.id}` });
// }

// @desc    Delete single campground
// @route   DELETE /api/v1/campgrounds/:id
// @access  Private
exports.deleteCampground = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    await Booking.deleteMany({ campground: req.params.id });
    await Campground.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};



