interface Embed {
    title: string,
    color?: number,
    url?: string,
    author?: Author,
    description?: string,
    thumbnail?: {url: string},
    fields?: Array<Field>,
    image?: {url: string},
    timestamp?: Date,
    footer?: Footer
}
interface Author {
    name: string,
    icon_url?: string,
    url?: string
}
interface Field{
    name: string,
    value: string,
    incline?: boolean
}
interface Footer{
    text: string,
    icon_url?: string
}

class EmbedClass implements Embed{
    title: string;
    color?: number;
    url?: string;
    author?: Author;
    description?: string;
    thumbnail?: {url: string};
    fields?: Array<Field>;
    image?: {url: string};
    timestamp?: Date;
    footer?: Footer;
    constructor(data: Embed){
        this.title = data.title;
        this.color = 'color' in data.color ? data.color : null;
    }
}

export {
    Embed
}

