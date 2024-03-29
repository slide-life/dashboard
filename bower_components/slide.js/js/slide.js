import Crypto from './slide/crypto';
import Actor from './slide/actor';
import Conversation from './slide/conversation';
import User from './slide/user';
import Block from './slide/block';
import Vendor from './slide/vendor';
import Form from './slide/form';
import VendorForm from './slide/vendor_form';
import VendorUser from './slide/vendor_user';

var Slide = {
  DEFAULT_ORGANIZATION: 'slide.life',
  CACHED_BLOCKS: {},

  crypto: new Crypto(),
  Actor: Actor,
  Conversation: Conversation,
  User: User,
  Vendor: Vendor,
  VendorForm: VendorForm,
  VendorUser: VendorUser,
  Block: Block,
  Form: Form,

  extractBlocks: function (form) {
    return form.find('*').map(function () {
      return $(this).attr('data-slide');
    }).toArray();
  },

  populateFields: function (form, fields, sec) {
    form.find('*').each(function () {
      var field = $(this).attr('data-slide');
      if (!!field && fields[field]) {
        $(this).val(fields[field]);
      }
    });
  },

  prepareModal: function (title) {
    if (!this._modal) {
      this._modal = $('<div class="slide-modal"></div>');
      var header = $('<div class="slide-modal-header"></div>').append('<div class="slide-logo"></div>', '<div class="slide-modal-action"></div>');
      this._modal.append(header, '<div class="slide-modal-body"></div>');
      this._modal.appendTo($('body'));
    }
    return this._modal;
  },

  insertVendorForm: function(form, vendor, onClick) {
    var modal = this.prepareModal('Your Forms');
    var list = modal.find('.form-list');
    var li = $("<li></li>");
    li.click(function(evt) {
      onClick(form);
    });
    li.text(form.name);
    list.prepend(li);
  },

  presentVendorForms: function(forms, vendor, onCreate, onClick) {
    var modal = this.prepareModal('Your Forms');
    modal.toggle();
    var list = $("<ul class='form-list'></ul>");
    modal.append(list);
    var addBtn = $('<a href="#">Add</a>');
    modal.find('.slide-modal-action').append(addBtn);
    addBtn.click(function(evt) {
      evt.preventDefault();
      onCreate();
    });
    forms.forEach(function(form) {
      var li = $("<li></li>");
      li.click(function(evt) {
        onClick(form);
      });
      li.text(form.name);
      list.append(li);
    })
  },

  presentFormsModal: function(forms, user, cb) {
    var modal = this.prepareModal('Your Forms');
    modal.toggle();
    var list = $("<ul class='form-list'></ul>");
    modal.append(list);
    forms.forEach(function(form) {
      var li = $("<li></li>");
      li.click(function(evt) {
        Slide.presentModalForm(form, user.profile, cb);
      });
      li.text(form.name);
      list.append(li);
    })
  },

  presentModalForm: function (vendorForm, userData, cb) {
      var identifiers = vendorForm.fields;
      var modal = this.prepareModal();
      this.Form.createFromIdentifiers(modal.find('.slide-modal-body'), identifiers, function (form) {
        form.build(userData, {
          onSubmit: function () {
            cb(vendorForm, form, form.getUserData(), form.getPatchedUserData());
          }
        });
        modal.show();
        $(window).trigger('resize');
    });
  },

  presentModalFormWithIdentifiers: function (identifiers, userData, cb) {
      var modal = this.prepareModal();
      this.Form.createFromIdentifiers(modal.find('.slide-modal-body'), identifiers, function (form) {
        form.build(userData, {
          onSubmit: function () {
            cb(form);
          }
        });
        modal.show();
        $(window).trigger('resize');
    });
  }
};

window.Slide = Slide;
