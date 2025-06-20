"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContacts = exports.updateContact = exports.deleteContacts = exports.getContact = exports.getContacts = exports.createContact = void 0;
const Contact_1 = __importDefault(require("../schema/Contact"));
const utils_1 = require("../utils");
const email_1 = require("../utils/email");
const createContact = async (req, res, next) => {
    try {
        const missingField = (0, utils_1.getMissingFields)(req.body, [
            'name',
            'email',
            'subject',
            'content'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const contact = await Contact_1.default.create({
            ...req.body
        });
        res.status(200).json({
            success: true
        });
        (0, email_1.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [contact.email],
            subject: 'Thank you for contacting us',
            template: 'contact.html',
            params: [
                {
                    key: 'name',
                    value: contact.name
                },
                {
                    key: 'subject',
                    value: contact.subject
                },
                {
                    key: 'content',
                    value: contact.content
                }
            ]
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.createContact = createContact;
const getContacts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort, subject } = req.query;
        const search = (0, utils_1.createSearchObject)({
            searchLikeObject: subject ? { subject } : {}
        });
        const contacts = await Contact_1.default.find(search)
            .select('-content')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sort || 'createdAt']: 'desc' })
            .lean();
        const total = await Contact_1.default.countDocuments(search).exec();
        res.status(200).json({
            contacts,
            total,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getContacts = getContacts;
const getContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact_1.default.findById(id);
        if (!contact) {
            res.status(400).json({
                error: true,
                message: 'Contact not found'
            });
            return next(new Error('Contact not found'));
        }
        res.status(200).json({
            contact
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getContact = getContact;
const deleteContacts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await Contact_1.default.deleteMany({
            _id: {
                $in: ids
            }
        });
        res.status(200).json({
            success: true,
            message: 'Contact have been updated.'
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteContacts = deleteContacts;
const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact_1.default.findById(id);
        if (!contact) {
            res.status(404).json({
                error: true,
                message: 'Contact not found'
            });
            return next(new Error('Contact not found'));
        }
        const updatedContact = await Contact_1.default.findByIdAndUpdate(id, {
            $set: req.body
        }, { new: true });
        res.status(200).json({
            contact: updatedContact
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.updateContact = updateContact;
const updateContacts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await Contact_1.default.updateMany({
            _id: {
                $in: ids
            }
        }, {
            isDone: true,
            isRead: true
        });
        res.status(200).json({
            success: true,
            message: 'Contact have been updated.'
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.updateContacts = updateContacts;
