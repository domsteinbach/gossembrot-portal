import { Injectable } from '@angular/core';

// Generic Custom Element Class
class TeiElement extends HTMLElement {
  teiElementName!: string;
  tooltipText?: string;

  constructor(name: string) {
    super();
    this.teiElementName = name;
  }

  connectedCallback() {}
}

class TeiSic extends TeiElement {
  constructor() {
    super('tei-sic');
  }

  override connectedCallback() {
    this.updateTooltip();
  }

  updateTooltip() {
    // Set the tooltip based on the current text content of the element
    const textContent = this.textContent?.trim();
    let tooltip = '';
    if (textContent) {
      tooltip = `<div>Offensichtlicher Fehler: "${textContent}"</div>`;
    }
    this.dataset['tooltip'] = tooltip;
  }
}

class TeiK extends TeiElement {
  constructor() {
    super('tei-k');
  }

  override connectedCallback() {
    this.updateTooltip();
  }

  updateTooltip() {
    // Set the tooltip based on the current text content of the element
    const korr = this.querySelector('tei-w');
    let tooltipContent = '';
    if (korr) {
      tooltipContent = `<div>Unkorrigierte Form: ${korr.outerHTML}</div>`;
    }
    this.dataset['tooltip'] = tooltipContent;
  }
}

// Function to dynamically define a custom element if it hasn't been defined yet
function defineCustomElement(name: string) {
  if (!customElements.get(name)) {
    customElements.define(
      name,
      class extends TeiElement {
        constructor() {
          super(name);
        }
      }
    );
  }
}

type TeiElementConstructor = new () => TeiElement;

@Injectable({
  providedIn: 'root',
})
export class XmlTransformService {
  // Registry for TEI element names and their corresponding classes
  teiElementRegistry: { [key: string]: TeiElementConstructor } = {};

  constructor() {
    this.registerTeiElement('sic', TeiSic);
    this.registerTeiElement('k', TeiK);
    // iterate all teiElementRegistry entries and define as customElement
    Object.keys(this.teiElementRegistry).forEach((name) => {
      customElements.define(`tei-${name}`, this.teiElementRegistry[name]);
    });
  }

  registerTeiElement(name: string, elementClass: TeiElementConstructor) {
    this.teiElementRegistry[name] = elementClass;
  }

  createTeiElement(name: string): TeiElement {
    const ElementClass = this.teiElementRegistry[name];
    if (ElementClass) {
      return new ElementClass();
    } else {
      return new TeiElement(name);
    }
  }

  transformXmlToHtml(
    xmlString: string,
    stringsToHighlight: string[] = []
  ): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    let targetElement: HTMLElement | null = xmlDoc.querySelector('p');
    if (!targetElement) {
      targetElement = xmlDoc.documentElement;
    }

    const transformedContent = this.transformNode(
      targetElement,
      xmlDoc,
      stringsToHighlight
    );
    const serializer = new XMLSerializer();

    // Return the transformed content as a string and replace self-closing elements with non-self-closing elements
    return serializer
      .serializeToString(transformedContent)
      .replace(/<([^/>]+)\/>/g, '<$1></$1>');
  }

  // Recursively transform the XML nodes to custom tei HTML nodes
  private transformNode(
    node: Node,
    xmlDoc: Document,
    stringsToHighlight: string[]
  ): Node {
    if (node.nodeType === Node.ELEMENT_NODE) {
      let element: TeiElement | HTMLElement;
      if (this.teiElementRegistry[node.nodeName]) {
        element = this.createTeiElement(node.nodeName);
      } else {
        const nodeName = `tei-${node.nodeName}`;
        defineCustomElement(nodeName);
        element = xmlDoc.createElement(nodeName);
      }

      // Copy all attributes from the original node to the custom element
      Array.from((node as Element).attributes).forEach((attr) => {
        element.setAttribute(attr.name, attr.value);
      });

      // Process all child nodes
      Array.from(node.childNodes).forEach((child) => {
        element.appendChild(
          this.transformNode(child, xmlDoc, stringsToHighlight)
        );
      });

      return element;
    } else if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node.cloneNode() as Text;
      if (stringsToHighlight.length > 0 && textNode.nodeValue) {
        const highlightedText = this.highlightText(
          textNode.nodeValue,
          stringsToHighlight
        );

        const wrapper = xmlDoc.createElement('span');
        wrapper.innerHTML = highlightedText;
        return wrapper;
      }

      return textNode;
    } else {
      return xmlDoc.createTextNode('');
    }
  }

  private highlightText(text: string, stringsToHighlight: string[]): string {
    let highlightedText = text;
    stringsToHighlight.forEach((stringToHighlight) => {
      // Regex to match the stringToHighlight, case-insensitive, and global
      const regex = new RegExp(
        `(${stringToHighlight
          .split('')
          .map((char) => `\\(?${char}\\)?`)
          .join('')})`,
        'gi'
      );
      highlightedText = highlightedText.replace(
        regex,
        '<span class="highlighted-substr">$1</span>'
      );
    });
    return highlightedText;
  }
}
