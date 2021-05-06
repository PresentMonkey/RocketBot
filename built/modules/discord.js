class Embed {
    constructor(data) {
        this.setup(data);
    }
    setup(data) {
        this.title = 'title' in data ? data.title : 'Title';
        this.description = 'description' in data ? data.description : null;
        this.color = 'color' in data ? data.color : null;
        this.fields = 'fields' in data ? data.fields : [];
        this.footer = 'footer' in data ? data.footer : null;
        this.metadata = 'metadata' in data ? data.metadata : null;
    }
    setTitle(title) {
        this.title = title;
    }
    setDescription(description) {
        this.description = description;
    }
    setColor(color) {
        this.color = color;
    }
    setFields(fields) {
        this.fields = fields;
    }
    setFooter(footer) {
        this.footer = footer;
    }
    setMetadata(metadata) {
        this.metadata = metadata;
    }
    appendTitle(text) {
        this.title = this.title + text;
    }
    appendDescription(text) {
        this.description = this.description + text;
    }
    appendFields(field) {
        this.fields.push(field);
    }
    setDescriptionBold() {
        this.descriptionBold = true;
    }
    get raw() {
        if (this.descriptionBold) {
            var description = `**${this.description}**`;
        }
        return {
            embed: {
                title: this.title,
                description: description,
                fields: this.fields,
                color: this.color,
                footer: this.footer
            }
        };
    }
    get meta() {
        return this.metadata;
    }
}
module.exports = {
    Embed
};
