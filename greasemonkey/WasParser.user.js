// ==UserScript==
// @name        WasParser
// @namespace   net.monobit.wasparser
// @description Parses WAS console to create synthetic.xml and java enum entries
// @include     https://*:9043/ibm/console/*
// @require     http://cdn.jsdelivr.net/mustache.js/0.8.1/mustache.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js
// @version     1
// @grant       none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);
this.templates = {

synthetic: 
'{{#attributes}}\
<property name="{{name}}"{{#kind}} kind="{{kind}}"{{/kind}}{{#password}} password="{{password}}"{{/password}}{{#javaName}} enumClass="{{javaPackage}}.{{javaName}}"{{/javaName}}{{#defaultValue}} default="{{{defaultValue}}}"{{/defaultValue}}{{^required}} required="{{required}}"{{/required}} label="{{label}}"{{#category}} category="{{category}}"{{/category}} description="{{{description}}}"/>\n\n\
{{/attributes}}',

enums:
'{{#attributes}}\
{{#javaName}}\
package {{javaPackage}};\n\
public enum {{javaName}} {\n\
    {{javaEnumValues}}\n\
}\n\n\
{{/javaName}}\
{{/attributes}}'
}

$(document).ready(function()
{
    $("#title-bread-crumb")
        .append("<input type='button' value='Parse'/><div><textArea rows='15' cols='120' id='results' hidden='true'></textArea></div>")
        .click(parsePageAndRender);
    Mustache.parse(templates.synthetic);
});

function parsePageAndRender() {
    var attributes = parsePage();
    render(attributes);
}

function parsePage() {
    var attributes = []

    $("form").find(":input[type='text'],:input[type='checkbox'],:input[type='password'], select, textarea").each(function() {
        var inputEl = $(this);
        var labelEl = inputEl.parent().find("label").first();
        var attr = {
            name: inputEl.attr("name"),
            required: inputEl.hasClass("textEntryRequired"),
            description: inputEl.attr("title") || labelEl.attr("title"),
            label: $.trim(labelEl.text().replace(/\r?\n|\r/g,'')),
            hidden: inputEl.is(":disabled"),
            category: $.trim(inputEl.parents("fieldset").find("legend").text())
        };
        
        if(inputEl.is("input[type='checkbox']")) {
            attr.kind = "boolean";
            attr.defaultValue = inputEl.is(':checked');
        }
        else if(inputEl.is("input[type='password']")) {
            attr.password = true;
            attr.kind = null;
            attr.defaultValue = null;
        }
        else if(inputEl.is("select")) {
            attr.kind = "enum";
            attr.defaultValue = inputEl.find("option:selected").val();
            attr.enumValues = inputEl.children("option").map(function() {return this.value;}).get()
        }
        else {
            attr.defaultValue = inputEl.val();
            attr.kind = parseInt(attr.defaultValue) != NaN ? "integer" : null;
        }
        
        attributes.push(attr);
    });
    return attributes;
}

function render(attributes) {
    attributes.map(function(attr) {
        if(attr.kind === "enum") {
            attr.javaPackage = "com.xebialabs.deployit.plugin.was.deployed.generated";
            attr.javaName = attr.name[0].toUpperCase() + attr.name.slice(1);
            attr.javaEnumValues = attr.enumValues.join(", ");
        }
    });
    var syntheticOut = Mustache.render(templates.synthetic, {"attributes": attributes});
    var enumOut = Mustache.render(templates.enums, {"attributes": attributes});
    $("#results").show().text(syntheticOut + enumOut);
}
