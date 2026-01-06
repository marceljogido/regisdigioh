const db = require('../models');
const Attribute = db.Attribute;
const { Op } = require('sequelize');

// Insert New Event Attributes
exports.createEventAttributeInternal = async (body, options = {}) => {
    const { event_id, guest_id, attribute_key, attribute_value } = body;
    return await Attribute.create({
        event_id,
        guest_id,
        attribute_key,
        attribute_value
    }, options);
};

// Delete an Event Attributes (On Delete Cascade reference Guest, this is for manual delete)
exports.deleteEventAttribute = async (req, res) => {
    try {
        const { event_id, guest_id, attribute_key } = req.body;
        const eventAttr = await Attribute.findOne({
            where: {
                event_id,
                guest_id,
                attribute_key
            }
        });
        if (!eventAttr) {
            return res.status(404).json({ message: 'Event Attribute not found' });
        }
        await eventAttr.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an Event Attributes
exports.updateEventAttribute = async ({ event_id, guest_id, attribute_key, attribute_value, transaction }) => {
    try {
        const eventAttr = await Attribute.findOne({
            where: {
                event_id,
                guest_id,
                attribute_key
            },
        });

        const valueAsString = typeof attribute_value === 'string' ? attribute_value : JSON.stringify(attribute_value);

        if (eventAttr) {
            eventAttr.attribute_value = valueAsString;
            await eventAttr.save({ transaction });
            return eventAttr;
        } else {
            const newAttr = await Attribute.create(
                {
                    event_id,
                    guest_id,
                    attribute_key,
                    attribute_value: valueAsString
                },
                { transaction }
            );
            return newAttr;
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get All Event Attributes
exports.getAllEventAttributes = async (req, res) => {
    try {
        const eventAttrs = await Attribute.findAll();
        res.json(eventAttrs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Event Attributes Key by Event ID (select distinct)
exports.getEventAttributeKeysByEventId = async (req, res) => {
    try {
        const { event_id } = req.body;
        const eventAttrKeys = await Attribute.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('attribute_key')), 'attribute_key']],
            where: {
                event_id
            }
        });
        res.json(eventAttrKeys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Event Attributes Value by Event ID
exports.getEventAttributeValuesByEventId = async (req, res) => {
    try {
        const { event_id } = req.body;
        const eventAttrValues = await Attribute.findAll({
            attributes: ['attribute_value'],
            where: {
                event_id
            }
        });
        res.json(eventAttrValues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Event Attributes (Key and Value) by Event ID
exports.getEventAttributesByKeyValueByEventId = async (req, res) => {
    try {
        const { event_id } = req.body;
        const eventAttrs = await Attribute.findAll({
            attributes: ['attribute_key', 'attribute_value'],
            where: {
                event_id
            }
        });
        res.json(eventAttrs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Event Attributes (Key and Value) by Event ID and Guest ID
exports.getEventAttributesByKeyValueByEventAndGuestId = async (req, res) => {
    try {
        const { event_id, guest_id } = req.body;
        const eventAttrs = await Attribute.findAll({
            attributes: ['attribute_key', 'attribute_value'],
            where: {
                event_id,
                guest_id
            }
        });
        res.json(eventAttrs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
