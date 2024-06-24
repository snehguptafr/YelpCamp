const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
  const camp = new Campground(req.body.campground);
  camp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
  camp.author = req.user._id;
  await camp.save();
  req.flash("success", "Successfully created a campground")
  res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.showCampground = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
      .populate({path: "reviews", populate:{ path: "author" }})
      .populate("author");
    if(!camp){
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { camp });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { camp });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const campg = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campg.images.push(...images);
    await campg.save();
    if(req.body.deleteImages){
      for(let filename of req.body.deleteImages){
        cloudinary.uploader.destroy(filename);
      }
      await campg.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
      console.log(campg)
    }
    req.flash("success", "Successfully updated a campground")
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground")
    res.redirect("/campgrounds");
}