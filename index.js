/*
    Copyright (c) 2009-2010 George Moschovitis, [http://www.gmosx.com](http://www.gmosx.com)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

addToClasspath(module.resolve("jars/htmlparser-1.2.1.jar"));

var JInputSource = org.xml.sax.InputSource,
    JStringReader = java.io.StringReader,
    JHtmlDocumentBuilder = Packages.nu.validator.htmlparser.dom.HtmlDocumentBuilder;

var jparser = new JHtmlDocumentBuilder();

var extend = function(Klass, Zuper) {
    Klass.prototype = Object.create(Zuper.prototype);
    Klass.prototype.constructor = Klass;
}

/**
 */
exports.parse = function(html, options) {
    return (new HTMLParser(options)).parse(html);
}

/**
 * A HTML5 parser.
 * 
 * Based on:
 * http://about.validator.nu/htmlparser/
 */
var HTMLParser = exports.HTMLParser = function(options) {
}

HTMLParser.prototype.parseRaw = function(html) {
    var source = new JInputSource(new JStringReader(html));
//    source.setEncoding("UTF-8");
    return jparser.parse(source);
}

HTMLParser.prototype.parse = function(html) {
    return new HTMLDocument(this.parseRaw(html));
}

/**
 * An HTML Node.
 */
var HTMLNode = function(jnode) {
    this._raw = jnode;
}

HTMLNode.prototype.getChildNodes = function() {
    return _nodelistToArray(this._raw.getChildNodes());
}

Object.defineProperty(HTMLNode.prototype, "nodeName", {
    get: function() {
        return String(this._raw.getNodeName());
    }
});

Object.defineProperty(HTMLNode.prototype, "nodeType", {
    get: function() {
        return Number(this._raw.getNodeType());
    }
});

Object.defineProperty(HTMLNode.prototype, "nodeValue", {
    get: function() {
        return String(this._raw.getNodeValue());
    }
});

Object.defineProperty(HTMLNode.prototype, "textContent", {
    get: function() {
        return String(this._raw.getTextContent());
    },
    set: function(content) {
        return String(this._raw.setTextContent(content));
    }    
});


HTMLNode.prototype.remove = function() {
    return this.parentNode.removeChild(this);
};

HTMLNode.prototype.toString = function() {
    return this.nodeName;
}        

var JDom2Sax = Packages.nu.validator.htmlparser.dom.Dom2Sax,
    JHtmlSerializer = Packages.nu.validator.htmlparser.sax.HtmlSerializer,
    JStringWriter = java.io.StringWriter;

HTMLNode.prototype.toHTML = function() {
    var w = new JStringWriter(),
        s = new JHtmlSerializer(w);

    new JDom2Sax(s, s).parse(this._raw);

    return String(w.toString());
}        

/**
 * HTML Document.
 */
var HTMLDocument = function(jdocument) {
    this._raw = jdocument;
}

extend(HTMLDocument, HTMLNode);

HTMLDocument.prototype.createElement = function(tagName) {
    return new HTMLElement(this._raw.createElementNS("http://www.w3.org/1999/xhtml", tagName));
}

HTMLDocument.prototype.createComment = function(data) {
    return new HTMLElement(this._raw.createComment(data));
}

HTMLDocument.prototype.getElementById = function(id) {
    return new HTMLElement(this._raw.getElementById(id));
}

HTMLDocument.prototype.getElementsByTagName = function(tagname) {
    return _nodelistToArray(this._raw.getElementsByTagName(tagname));
}

Object.defineProperty(HTMLDocument.prototype, "documentElement", {
    get: function() {
        return new HTMLElement(this._raw.getDocumentElement());
    }
});

/**
 * HTML Element.
 */
var HTMLElement = function(jelement) {
    this._raw = jelement;
}

extend(HTMLElement, HTMLNode);

HTMLElement.prototype.appendChild = function(newChild) {
    return new HTMLElement(this._raw.appendChild(newChild._raw));
}

Object.defineProperty(HTMLElement.prototype, "checked", {
    get: function() {
        return this.hasAttribute("checked");
    }
});

Object.defineProperty(HTMLElement.prototype, "childNodes", {
    get: function() {
        return _nodelistToArray(this._raw.getChildNodes());
    }
});

Object.defineProperty(HTMLElement.prototype, "className", {
    get: function() {
        return this.getAttribute("class");
    }
});

HTMLElement.prototype.compareDocumentPosition = function(other) {
    return Number(this._raw.compareDocumentPosition(other));
}

Object.defineProperty(HTMLElement.prototype, "disabled", {
    get: function() {
        return this.hasAttribute("disabled");
    }
});

Object.defineProperty(HTMLElement.prototype, "firstChild", {
    get: function() {
        var n = this._raw.getFirstChild();
        return n ? new HTMLElement(n) : null;
    }
});

HTMLElement.prototype.getAttribute = function(name) {
    if (this._raw.getAttribute) {
        return String(this._raw.getAttribute(name));
    } else {
        return "";
    }
}

HTMLElement.prototype.getAttributeNode = function(name) {
    var n = this._raw.getAttributeNode(name);
    return n ? new HTMLElement(n) : null;
}

HTMLElement.prototype.getElementsByTagName = function(tagname) {
    return _nodelistToArray(this._raw.getElementsByTagName(tagname));
}

HTMLElement.prototype.hasAttribute = function(name) {
    return this._raw.hasAttribute(name);
}

HTMLElement.prototype.removeAttribute = function(name) {
    return this._raw.removeAttribute(name);
}

Object.defineProperty(HTMLElement.prototype, "href", {
    get: function() {
        return String(this.getAttribute("href"));
    }
});

HTMLElement.prototype.insertBefore = function(newChild, refChild) {
    return new HTMLElement(this._raw.insertBefore(newChild._raw, refChild._raw));
}

Object.defineProperty(HTMLElement.prototype, "lastChild", {
    get: function() {
        var n = this._raw.getLastChild();
        return n ? new HTMLElement(n) : null;
    }
});

Object.defineProperty(HTMLElement.prototype, "nextSibling", {
    get: function() {
        var n = this._raw.getNextSibling();
        return n ? new HTMLElement(n) : null;
    }
});

Object.defineProperty(HTMLElement.prototype, "ownerDocument", {
    get: function() {
        return new HTMLElement(this._raw.getOwnerDocument());
    }
});

Object.defineProperty(HTMLElement.prototype, "parentNode", {
    get: function() {
        var n = this._raw.getParentNode();
        return n ? new HTMLElement(n) : null;
    }
});

Object.defineProperty(HTMLElement.prototype, "previousSibling", {
    get: function() {
        var n = this._raw.getPreviousSibling();
        return n ? new HTMLElement(n) : null;
    }
});

HTMLElement.prototype.removeChild = function(oldChild) {
    return new HTMLElement(this._raw.removeChild(oldChild._raw));
}

Object.defineProperty(HTMLElement.prototype, "selected", {
    get: function() {
        return this.hasAttribute("selected");
    }
});

Object.defineProperty(HTMLElement.prototype, "type", {
    get: function() {
        return String(this.getAttribute("type"));
    }
});

var _nodelistToArray = function(nodelist) {
    var arr = [];

    for (var i = 0; i < nodelist.getLength(); i++) {
        arr.push(new HTMLElement(nodelist.item(i)));
    }
 
    return arr;
}
