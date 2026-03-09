const Listing = require("../models/listing");
const Message = require("../models/message");

// contact page
const contactHostPage = async (req, res) => {
    const listing = await Listing.findById(req.params.listingId).populate("owner");
    res.render("messages/contact", { listing,currentUser:req.user });
};

// send message
const sendMessage = async (req, res) => {
    const listing = await Listing.findById(req.params.listingId);

    await Message.create({
        text: req.body.message,
        sender: req.user._id,
        receiver: listing.owner._id,
        listing: listing._id
    });

    res.redirect("/messages/inbox");
};

// inbox
const inbox = async (req, res) => {
    const messages = await Message.find({
        receiver: req.user._id
    })
        .populate("sender listing")
        .sort({ createdAt: -1 });

    res.render("messages/inbox", { messages });
};

// chat page
const chat = async (req, res) => {
    const { userId, listingId } = req.params;

    const messages = await Message.find({
        listing: listingId,
        $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id }
        ]
    }).sort({ createdAt: 1 });

    res.render("messages/chat", {
        messages,
        userId,
        listingId,
        currentUser: req.user
    });
};

// reply
const reply = async (req, res) => {
    const { userId, listingId } = req.params;

    await Message.create({
        text: req.body.text,
        sender: req.user._id,
        receiver: userId,
        listing: listingId
    });

    res.redirect(`/messages/chat/${userId}/${listingId}`);
};

const fetchMessages = async (req, res) => {
    const { userId, listingId } = req.params;

    const messages = await Message.find({
        listing: listingId,
        $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id }
        ]
    }).sort({ createdAt: 1 });

    res.json(messages);
};
module.exports = {
    contactHostPage,
    sendMessage,
    inbox,
    chat,
    reply,
    fetchMessages
};