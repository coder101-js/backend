// import jwt from 'jsonwebtoken'
import Contact from '../../Database/contact.mjs'

export const sendData = async (req, res) => {
  try {
    // const { token } = req.cookies;

    // if (!token) {
    //   return res.status(403).send({ err: 'Unauthorized' });
    // }

    // Optional: Verify the JWT if needed (for extra security)
    // let user;
    // try {
    //   user = jwt.verify(token, process.env.JWT_SECRET);
    // } catch (err) {
    //   return res.status(403).send({ err: 'Invalid token' });
    // }

    // Pagination stuff
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 }) // optional: newest first
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();

    res.send({
      data: contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error('🔥 Error:', err);
    return res.status(500).send({ err: 'Internal server error!' });
  }
};

