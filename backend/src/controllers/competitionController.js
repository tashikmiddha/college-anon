import Competition from '../models/Competition.js';
import User from '../models/User.js';
import { uploadImage as uploadImageToCloudinary } from '../config/cloudinary.js';

// @desc    Create new competition
// @route   POST /api/competitions
// @access  Private (Premium Only)
export const createCompetition = async (req, res) => {
  try {
    const { title, description, type, options, durationHours } = req.body;

    console.log('=== CREATE COMPETITION DEBUG ===');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Type:', type);
    console.log('Duration:', durationHours);
    console.log('Options received:', options, typeof options);
    console.log('Files received:', req.files ? req.files.length : 0);
    if (req.files) {
      req.files.forEach((file, i) => {
        console.log(`  File ${i}: ${file.originalname}, ${file.mimetype}, ${file.size} bytes`);
      });
    }

    // Check if user is premium
    if (!req.user.isPremium) {
      return res.status(403).json({ 
        message: 'Premium membership required to create competitions',
        requiresPremium: true
      });
    }

    // Check competition quota
    if (req.user.premiumUsage.competitions >= req.user.premiumLimits.competitions) {
      return res.status(403).json({ 
        message: 'You have reached your competition limit',
        current: req.user.premiumUsage.competitions,
        limit: req.user.premiumLimits.competitions
      });
    }

    // Check for duplicate competition (prevent rapid double submissions)
    const recentCompetition = await Competition.findOne({
      author: req.user._id,
      createdAt: { $gt: new Date(Date.now() - 30000) }, // Last 30 seconds
      title: title.trim()
    });

    if (recentCompetition) {
      return res.status(400).json({ 
        message: 'A competition with this title was just created. Please wait a moment before creating another.' 
      });
    }

    // Parse options if it's a string (from FormData)
    let parsedOptions;
    try {
      if (typeof options === 'string') {
        parsedOptions = JSON.parse(options);
      } else if (Array.isArray(options)) {
        parsedOptions = options;
      } else {
        console.error('Options is not a string or array:', typeof options, options);
        return res.status(400).json({ message: 'Invalid options format: expected array' });
      }
    } catch (e) {
      console.error('Error parsing options:', e);
      return res.status(400).json({ message: 'Invalid options JSON format' });
    }

    console.log('Parsed options:', parsedOptions);

    // Validation - use parsedOptions
    if (!title || !parsedOptions || !Array.isArray(parsedOptions) || parsedOptions.length < 2) {
      return res.status(400).json({ 
        message: 'Please provide a title and at least 2 options' 
      });
    }

    // Calculate expiry time
    const duration = parseInt(durationHours) || 24;
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    // Process options with images - make uploads optional
    const processedOptions = await Promise.all(parsedOptions.map(async (opt, index) => {
      let imageData = { url: '', publicId: '' };
      
      // Handle image upload if provided as file
      if (req.files && req.files[index]) {
        try {
          console.log(`Uploading image for option ${index + 1} (${opt.name})...`);
          const result = await uploadImageToCloudinary(req.files[index].buffer, 'college-anon/competitions');
          console.log(`Image uploaded successfully: ${result.url}`);
          imageData = {
            url: result.url,
            publicId: result.publicId
          };
        } catch (error) {
          console.error(`Error uploading image for option ${index + 1}:`, error);
          // Continue without image - don't fail the whole request
          console.log(`Creating competition without image for option ${index + 1}`);
        }
      } else {
        console.log(`No file uploaded for option ${index + 1}`);
        // Check if there's an existing image URL in the option
        if (opt.image && typeof opt.image === 'object' && opt.image.url) {
          imageData = opt.image;
        }
      }

      return {
        name: opt.name,
        image: imageData,
        votes: [],
        voteCount: 0
      };
    }));

    console.log('Processed options:', processedOptions.map(o => ({ name: o.name, hasImage: !!o.image.url })));

    const competition = await Competition.create({
      author: req.user._id,
      college: req.user.college,
      anonId: req.user.anonId,
      displayName: req.user.displayName,
      title,
      description: description || '',
      type: type || 'comparison',
      options: processedOptions,
      expiresAt,
      voters: [],
      totalVotes: 0
    });

    // Increment competition usage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'premiumUsage.competitions': 1 }
    });

    const populatedCompetition = await Competition.findById(competition._id)
      .populate('author', 'anonId displayName');

    console.log('Competition created successfully:', competition._id);
    res.status(201).json(populatedCompetition);
  } catch (error) {
    console.error('=== CREATE COMPETITION ERROR ===');
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all competitions
// @route   GET /api/competitions
// @access  Private (college-restricted)
export const getCompetitions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // Hide competitions that have expired (voting period is over)
    filter.expiresAt = { $gt: new Date() };

    // Non-admin users can only see their college's competitions
    if (req.user && !req.user.isAdmin) {
      filter.college = req.user.college;
    } else if (req.query.college) {
      filter.college = req.query.college;
    }

    const sortOption = req.query.sort || '-createdAt';
    const competitions = await Competition.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'anonId displayName');

    const total = await Competition.countDocuments(filter);

    // Add user voting status to each competition
    const competitionsWithVoteStatus = competitions.map(comp => {
      const compObj = comp.toObject();
      compObj.hasVoted = comp.hasUserVoted(req.user?._id);
      compObj.resultsVisible = comp.areResultsVisible();
      return compObj;
    });

    res.json({
      competitions: competitionsWithVoteStatus,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({ message: 'Failed to fetch competitions' });
  }
};

// @desc    Get single competition
// @route   GET /api/competitions/:id
// @access  Private (college-restricted)
export const getCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('author', 'anonId displayName');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check college access
    if (!req.user.isAdmin && competition.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You do not have permission to view this competition' 
      });
    }

    const competitionObj = competition.toObject();
    competitionObj.hasVoted = competition.hasUserVoted(req.user._id);
    competitionObj.resultsVisible = competition.areResultsVisible();

    // Hide vote counts if results not visible
    if (!competitionObj.resultsVisible) {
      competitionObj.options = competitionObj.options.map(opt => ({
        name: opt.name,
        image: opt.image,
        voteCount: 0 // Hide actual vote count
      }));
      competitionObj.totalVotes = 0;
    }

    res.json(competitionObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Vote on competition
// @route   POST /api/competitions/:id/vote
// @access  Private (college-restricted)
export const voteOnCompetition = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check college access
    if (!req.user.isAdmin && competition.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You do not have permission to vote on this competition' 
      });
    }

    // Check if voting period has ended (voting only allowed during competition)
    if (competition.areResultsVisible()) {
      return res.status(400).json({ message: 'Voting has ended for this competition' });
    }

    // Check if user has already voted
    if (competition.hasUserVoted(req.user._id)) {
      return res.status(400).json({ message: 'You have already voted on this competition' });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= competition.options.length) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    // Add vote
    competition.voters.push({
      user: req.user._id,
      optionIndex
    });
    competition.options[optionIndex].votes.push(req.user._id);
    competition.options[optionIndex].voteCount += 1;

    await competition.save();

    res.json({ 
      message: 'Vote recorded successfully',
      hasVoted: true,
      votedOption: optionIndex
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get competition results
// @route   GET /api/competitions/:id/results
// @access  Private (college-restricted)
export const getCompetitionResults = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('author', 'anonId displayName');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check college access
    if (!req.user.isAdmin && competition.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You do not have permission to view these results' 
      });
    }

    const competitionObj = competition.toObject();
    competitionObj.hasVoted = competition.hasUserVoted(req.user._id);
    competitionObj.resultsVisible = competition.areResultsVisible();

    res.json(competitionObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete own competition
// @route   DELETE /api/competitions/:id
// @access  Private (Owner or Admin)
export const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Check ownership or admin
    if (competition.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this competition' });
    }

    competition.isActive = false;
    await competition.save();

    res.json({ message: 'Competition removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update competition (Admin only)
// @route   PUT /api/competitions/:id
// @access  Private (Admin only)
export const updateCompetition = async (req, res) => {
  try {
    const { title, description, durationHours, isActive } = req.body;
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Only admin can update competitions
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can update competitions' });
    }

    // Update fields if provided
    if (title !== undefined) competition.title = title.trim();
    if (description !== undefined) competition.description = description.trim();
    if (isActive !== undefined) competition.isActive = isActive;

    // Update expiry time if duration changed
    if (durationHours !== undefined) {
      const duration = parseInt(durationHours) || 24;
      competition.expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
    }

    await competition.save();

    const updatedCompetition = await Competition.findById(competition._id)
      .populate('author', 'anonId displayName');

    res.json(updatedCompetition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all competitions (Admin view - includes inactive and all colleges)
// @route   GET /api/competitions/admin/all
// @access  Private (Admin only)
export const getAllCompetitionsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Admin sees all competitions including inactive
    const filter = {};

    // Filter by college if specified
    if (req.query.college) {
      filter.college = req.query.college;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const sortOption = req.query.sort || '-createdAt';
    const competitions = await Competition.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'anonId displayName college');

    const total = await Competition.countDocuments(filter);

    res.json({
      competitions,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching all competitions (admin):', error);
    res.status(500).json({ message: 'Failed to fetch competitions' });
  }
};

