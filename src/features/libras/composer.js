/**
 * Dictionary for contextual suggestions.
 */
const DICTIONARY = [
    "OI", "OLA", "TUDO", "BEM", "OBRIGADO", "POR", "FAVOR", "DESCULPA", "NOME", "MEU",
    "ENTENDER", "LIBRAS", "APRENDER", "VOCE", "NOS", "ELES", "QUERER", "PRECISAR"
];

export function createComposer() {
    let transcript = "";

    function addChar(char) {
        transcript += char;
        return transcript;
    }

    function addSpace() {
        if (transcript.length > 0 && transcript[transcript.length - 1] !== " ") {
            transcript += " ";
        }
        return transcript;
    }

    function backspace() {
        transcript = transcript.slice(0, -1);
        return transcript;
    }

    function clear() {
        transcript = "";
        return transcript;
    }

    function getSuggestions() {
        const words = transcript.split(" ");
        const lastWord = words[words.length - 1].toUpperCase();
        
        if (!lastWord) return [];

        return DICTIONARY.filter(w => w.startsWith(lastWord) && w !== lastWord).slice(0, 5);
    }

    return {
        addChar,
        addSpace,
        backspace,
        clear,
        getSuggestions,
        get text() { return transcript; },
        set text(v) { transcript = v; }
    };
}
