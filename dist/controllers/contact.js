"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get createContact () {
        return createContact;
    },
    get deleteContacts () {
        return deleteContacts;
    },
    get getContact () {
        return getContact;
    },
    get getContacts () {
        return getContacts;
    },
    get updateContact () {
        return updateContact;
    },
    get updateContacts () {
        return updateContacts;
    }
});
const _Contact = /*#__PURE__*/ _interop_require_default(require("../schema/Contact"));
const _utils = require("../utils");
const _email = require("../utils/email");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const createContact = async (req, res, next)=>{
    try {
        const missingField = (0, _utils.getMissingFields)(req.body, [
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
        const contact = await _Contact.default.create({
            ...req.body
        });
        res.status(200).json({
            success: true
        });
        (0, _email.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [
                contact.email
            ],
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
    } catch (error) {
        return next(error);
    }
};
const getContacts = async (req, res, next)=>{
    try {
        const { page = 1, limit = 10, sort, subject } = req.query;
        const search = (0, _utils.createSearchObject)({
            searchLikeObject: subject ? {
                subject
            } : {}
        });
        const contacts = await _Contact.default.find(search).select('-content').skip((page - 1) * limit).limit(limit).sort({
            [sort || 'createdAt']: 'desc'
        }).lean();
        const total = await _Contact.default.countDocuments(search).exec();
        res.status(200).json({
            contacts,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return next(error);
    }
};
const getContact = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const contact = await _Contact.default.findById(id);
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
    } catch (error) {
        return next(error);
    }
};
const deleteContacts = async (req, res, next)=>{
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await _Contact.default.deleteMany({
            _id: {
                $in: ids
            }
        });
        res.status(200).json({
            success: true,
            message: 'Contact have been updated.'
        });
    } catch (error) {
        return next(error);
    }
};
const updateContact = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const contact = await _Contact.default.findById(id);
        if (!contact) {
            res.status(404).json({
                error: true,
                message: 'Contact not found'
            });
            return next(new Error('Contact not found'));
        }
        const updatedContact = await _Contact.default.findByIdAndUpdate(id, {
            $set: req.body
        }, {
            new: true
        });
        res.status(200).json({
            contact: updatedContact
        });
    } catch (error) {
        return next(error);
    }
};
const updateContacts = async (req, res, next)=>{
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await _Contact.default.updateMany({
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
    } catch (error) {
        return next(error);
    }
};

//# sourceMappingURL=contact.js.map