export const TEMPLATE_VARIABLES = ['theme', 'docs', 'language'];

export const TEMPLATE = `If one or more of the following songs talks about: {theme}
Then give me the album and track of the song/songs in this json format, only the json:
[
  {{
    "album": <album>
    "track": <track>
    "description": <a short description using only the text I give you>
  }},
  ...
]
Write the description in {language}.
If you can't find any song that talks about the theme just return: []
Songs:
{docs}
`;

export const validLanguages: {[key: string]: string} = {
  en: 'english',
  es: 'spanish',
};

export const DATA_PATH = 'data/faiss';
