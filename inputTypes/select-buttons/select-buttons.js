let cache = {};

AutoForm.addInputType("select-buttons", {
    template: "afSelectButtons",
    // Only a single element can be selected if true and it returns a string.
    // Otherwise it will return an array of value.
    singleSelection: false,
    allowFilter: false,

    valueOut: function() {
        // A function that AutoForm calls when it wants to know what the current value stored in your widget is.
        // In this function, this is the jQuery object representing the element that has the data-schema-key
        // attribute in your custom template. So, for example, in a simple case your valueOut function might
        // just do return this.val().

        // console.debug("this out",this,this[0]);
        var values = $(this[0]).find("button.btn_item.active").map(function() {
            return this.value;
        }).get();


        let key = this[0].getAttribute("data-schema-key");
        let singleSelection = cache[key] == "Y";
        if(Session.equals("debug",true)) {
            console.debug("valueOut ",values, singleSelection, cache, key, this[0].getAttribute("data-schema-key"));
            // console.debug("this[context]", this.context);
        }


        if(singleSelection) {
            return values[0];
        }

        return values;
    },
    contextAdjust: function(context) {
        // A function that adjusts the context object that your custom template receives.
        // That is, this function accepts an object argument, potentially modifies it, and then returns it.
        // That returned object then becomes this in your custom template.
        // If you need access to attributes of the parent autoForm in this function,
        // use AutoForm.getCurrentDataForForm() to get them.

        // console.debug("contextAdjust",context, this);
        cache[context.name] = context.atts.singleSelection;

        this.allowFilter = context.atts.allowFilter;
        this.i18nPrefix = context.atts.i18nPrefix || "";
        let colSizeClass = context.atts.colSizeClass || "col-sm-6";

        if(Session.equals("debug",true)) {
            console.debug("contextAdjust",context.value, context.selectOptions);
        }
        context.items = lodash.map(context.selectOptions, function(opt) {
            let selected = false;
            if(_.isArray(context.value)) {
                selected = context.value.indexOf(opt.value)!=-1;
            } else {
                selected = context.value == opt.value;
            }

            // if(Session.equals("debug",true)) {
            //     console.debug("items#",context.value, opt,selected);
            // }

            return {
                name: context.name,
                label: opt.label,
                colSizeClass: colSizeClass,
                value: opt.value,
                htmlAtts: lodash.omit(opt, 'label', 'value'),
                // _id must be included because it is a special property that
                // #each uses to track unique list items when adding and removing them
                // See https://github.com/meteor/meteor/issues/2174
                _id: opt.value,
                selected: selected,
                atts: context.atts
            };
        });
        return context;
    }
});

Template.afSelectButtons.onCreated(function() {
    this.filter = new ReactiveVar(false);
    this.deps = new Tracker.Dependency;
});
Template.afSelectButtons.onRendered(function() {
    // // Hack to display the value on first load
    // Meteor.setTimeout(() => {
    //     this.deps.changed();
    // }, 2000);

    // let actives = $(this.firstNode).find("button.btn_item.active");
    // console.debug("Custom select-buttons", this, actives);

});

Template.afSelectButtons.helpers({
    filter: function() {
        var filter = Template.instance().filter.get();
        //console.debug("filter",filter,this.value);
        if(filter && filter.length>0) {
            var found = this.value.toUpperCase().indexOf(filter.toUpperCase())!=-1;
            return !found ? "hidden" : "";
        }
        // No filter has been found, return true to allow value.
        return "";
    },
    isSelected: function() {
        if(this.selected) {
            // console.debug("is Selected", this, this.selected);
            return "active "+this.atts['activeClasses'];
        }
        return "";
    },
    format: function(prefix, value) {
        let format = TAPi18n.__(prefix+value);
        // console.debug("format "+value, this);
        return format;
    },
    currentValues: function() {
        var tpl = Template.instance();
        tpl.deps.depend();

        var values = this.value;
        // console.debug("currentValues ", values);

        if(tpl.firstNode!=null) {
            let mapper = $(tpl.firstNode).find("button.btn_item.active");
            values = mapper.map(function() {
                return this.value;
            }).get();
        }

        // Remove empty values
        values = lodash.filter(values, function(elt) {return elt.length>0;});
        // console.debug("current values are", values);
        return values;
    },
    dsk: function () {
        return {'data-schema-key': this.atts['data-schema-key']};
    },
    singleSelection: function () {
        return {'data-single-selection': this.atts['singleSelection']};
    },
    filterValue: function() {
        var filter = Template.instance().filter.get();
        return filter.length>0 ? filter : "";
    }
});

Template.afSelectButtons.events({
    "click button.btn_item": function(evt,tpl) {
        evt.preventDefault();

        var target = $(evt.target);

        let prev = tpl.$("button.btn_item.active");



        if(Session.equals("debug",true)) {
            console.debug("button has been clicked", evt.target.value);
            console.debug("atts are ", tpl.data.atts);
        }

        if(!target.hasClass("active")) {

            if(tpl.data.atts.singleSelection=="Y") {
                // Remove previous selection on single mode
                // console.debug("Remove previous selection on single mode")
                var actives = tpl.$("button.btn_item.active");
                actives.removeClass("active");
                actives.removeClass(tpl.data.atts.activeClasses);
            } else {
                // Check for special value
                /**
                 * RESET Value button is used to cancel out other value in a list of choices.
                 * For example if someone has to choose for a list of sports.
                 * One of the choice could be 'I don't like sports', this button can be used as a reset button.
                 * When selected it will automatically unselect all the other buttons.
                 */
                let resetValue = tpl.data.atts.resetValue;
                let val = target.val();
                // Check if the reset value is checked
                if(resetValue == val) {
                    // Reset previous values
                    var actives = tpl.$("button.btn_item.active");
                    actives.removeClass("active");
                    actives.removeClass(tpl.data.atts.activeClasses);
                } else if(resetValue) {
                    // Automatically uncheck resetValueButton
                    let resetValueButton = tpl.$("button.btn_item[value='"+resetValue+"']");
                    resetValueButton.removeClass("active");
                    resetValueButton.removeClass(tpl.data.atts.activeClasses);
                }
            }
            // Set the active class on current button
            target.addClass("active");

            if(tpl.data.atts.activeClasses) {
                target.addClass(tpl.data.atts.activeClasses);
            }
        } else {
            // console.debug("removing active classes");
            // Remove active button
            target.removeClass(tpl.data.atts.activeClasses);
            target.removeClass("active");
        }

        // Inform the listeners of the change
        tpl.deps.changed();

        var inputId = this.atts.id;
        //console.debug("click on ",target, this, tpl, inputId);

        // Backup the current value in the firstNode
        // (otherwise AutoForm doesn't detect the value on autosave)
        tpl.firstNode.value = evt.target.value;

        // Create custom 'blur' event to enable onblur validatino with AutoForm
        var evt_change = jQuery.Event("change");
        evt_change.target = tpl.firstNode;

        var evt_blur = jQuery.Event("blur");
        evt_blur.target = tpl.firstNode;

        // Make sure autoform can detect the change
        // and has compatibility with autosave
        var id = AutoForm.getFormId();
        //console.debug("triggering change autoform id ",id,evt_blur);
        $("#"+id).trigger(evt_change);
        $("#"+id).trigger(evt_blur);
    },
    "click .reset-filter": function(evt, tpl) {
        evt.preventDefault();
        tpl.filter.set(false);
        tpl.find("input.filter").value = "";
    },
    "keyup input.filter": function(evt, tpl) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();

        if(evt.keyCode==13) {
            // <Enter> has been pressed, update filter value.
            var filter = evt.target.value;
            tpl.filter.set(filter);
        } else if(evt.keyCode==27) {
            // <Esc> reset the filter
            evt.target.value = "";
            tpl.filter.set(false);
        } else {
            var filter = evt.target.value;
            tpl.filter.set(filter);
        }
    }
});

Template.afSelectButtons.onDestroyed(function() {
    // console.debug("select-buttons onDestroyed() ");
});
