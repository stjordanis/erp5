/*global window, rJS, RSVP, calculatePageTitle, FormData, URI, jIO, moment */
/*jslint nomen: true, indent: 2, maxerr: 3 */
(function (window, rJS, RSVP, calculatePageTitle, moment) {
  "use strict";

  rJS(window)
    /////////////////////////////////////////////////////////////////
    // Acquired methods
    /////////////////////////////////////////////////////////////////
    .declareAcquiredMethod("updateHeader", "updateHeader")
    .declareAcquiredMethod("getSetting", "getSetting")
    .declareAcquiredMethod("jio_getAttachment", "jio_getAttachment")
    .declareAcquiredMethod("jio_putAttachment", "jio_putAttachment")
    .declareAcquiredMethod("notifySubmitted", "notifySubmitted")
    .declareAcquiredMethod("getUrlFor", "getUrlFor")
    .declareAcquiredMethod("redirect", "redirect")


    /////////////////////////////////////////////////////////////////
    // declared methods
    /////////////////////////////////////////////////////////////////
    .declareMethod('getImageUrl', function (raw_url) {
      var gadget = this;
      return gadget.jio_getAttachment(raw_url, "links")
          .push(function (links) {
          var full_size_url = links._links.view[1].href;
          return gadget.getUrlFor({
            command: 'display',
            options: {
              jio_key: "image_module",
              view: full_size_url
            }
          });
        });
    })
    .declareMethod('getDocumentUrl', function (raw_url) {
      var gadget = this;
      return gadget.jio_getAttachment(raw_url, "links")
          .push(function (links) {
          var full_size_url = links._links.view[4].href;
          return gadget.getUrlFor({
            command: 'display',
            options: {
              jio_key: "document_module",
              view: full_size_url
            }
          });
        });
    })
    .declareMethod('render', function (options) {
      var gadget = this;
      gadget.options = options;
      return gadget.getSetting('hateoas_url')
        .push(function (hateoas_url) {
          gadget.hateoas_url = hateoas_url;
        })
        .push(function () {
          var state_dict = {
            id: options.jio_key,
            view: options.view,
            editable: options.editable,
            erp5_document: options.erp5_document,
            form_definition: options.form_definition,
            erp5_form: options.erp5_form || {}
          };
          return gadget.changeState(state_dict);
        });
    })
    .onStateChange(function () {
      /** @type {GadgetInstance} */
      var gadget = this;

      // render the erp5 form
      return this.getDeclaredGadget("erp5_form")
        .push(function (erp5_form) {
          return gadget.getDeclaredGadget("editor")
            .push(function (editor) {
              return [editor, erp5_form];
            });
        })
        .push(function (gadgets) {
          var form_options = gadget.state.erp5_form,
            rendered_form = gadget.state.erp5_document._embedded._view,
            rendered_field,
            key,
            editor = gadgets[0],
            erp5_form = gadgets[1];
          // Remove all empty fields, and mark all others as non editable
          for (key in rendered_form) {
            if (rendered_form.hasOwnProperty(key) && (key[0] !== "_")) {
              rendered_field = rendered_form[key];
              if ((rendered_field.type !== "ListBox") && ((!rendered_field.default) || (rendered_field.hidden === 1) || (rendered_field.default.length === 0)
                   || (rendered_field.default.length === 1 && (!rendered_field.default[0])))) {
                delete rendered_form[key];
              } else {
                rendered_field.editable = 0;
              }
            }
          }

          form_options.erp5_document = gadget.state.erp5_document;
          form_options.form_definition = gadget.state.form_definition;
          form_options.view = gadget.state.view;

          return gadget.jio_getAttachment(
            'post_module',
            gadget.hateoas_url + gadget.options.jio_key + "/Base_getEditorFieldPreferredTextEditor",
            {format: "text"}
          ).push(function (preferred_editor) {
            return new RSVP.Queue()
              .push(
                function () {
                  return RSVP.all([
                    erp5_form.render(form_options),
                    editor.render({
                      value: "",
                      key: "comment",
                      portal_type: "HTML Post",
                      editable: true,
                      editor: preferred_editor
                    })]);
                }
              ).push(function () {
                // make our submit button editable
                var element = gadget.element.querySelector('input[type="submit"]');
                element.removeAttribute('disabled');
                element.classList.remove('ui-disabled');
              });
          });
        })

        // render the header
        .push(function () {
          return RSVP.all([
            gadget.getUrlFor({command: 'change', options: {editable: true}}),
            gadget.getUrlFor({command: 'change', options: {page: "action"}}),
            gadget.getUrlFor({command: 'history_previous'}),
            gadget.getUrlFor({command: 'selection_previous'}),
            gadget.getUrlFor({command: 'selection_next'}),
            gadget.getUrlFor({command: 'change', options: {page: "tab"}}),
            gadget.state.erp5_document._links.action_object_report_jio ?
                gadget.getUrlFor({command: 'change', options: {page: "export"}}) :
                "",
            calculatePageTitle(gadget, gadget.state.erp5_document)
          ]);
        })
        .push(function (all_result) {
          return gadget.updateHeader({
            edit_url: all_result[0],
            actions_url: all_result[1],
            selection_url: all_result[2],
            previous_url: all_result[3],
            next_url: all_result[4],
            tab_url: all_result[5],
            export_url: all_result[6],
            page_title: all_result[7]
          });
        })
        .push(function () {
          // set locale for momentjs
          return gadget.jio_getAttachment(
            'post_module',
            gadget.hateoas_url + "/Localizer/get_selected_language",
            {format: 'text'}
          ).push(function (lang) {
            moment.locale(lang);
          });
        })
        .push(function () {
          return gadget.jio_getAttachment(
            'post_module',
            gadget.hateoas_url + gadget.options.jio_key + "/SupportRequest_getCommentPostListAsJson"
          );
        })
        .push(function (post_list) {
          var queue_list = [], i = 0;
          if (post_list.length) {
            for (i = 0; i < post_list.length; i += 1) {
              if (post_list[i].attachment_link !== null && post_list[i].attachment_link.indexOf("image_module") !== -1) {
                queue_list.push(gadget.getImageUrl(post_list[i].attachment_link));
              } else if (post_list[i].attachment_link !== null && post_list[i].attachment_link.indexOf("document_module") !== -1) {
                queue_list.push(gadget.getDocumentUrl(post_list[i].attachment_link));
              } else {
                queue_list.push(null);
              }
            }
          }
          queue_list.push(post_list);
          return RSVP.all(queue_list);
        })
        .push(function (result_list) {
          var s = '', i, comments = gadget.element.querySelector("#post_list"),
            plain_content, post_list = result_list.pop();
          if (post_list.length) {
            for (i = 0; i < post_list.length; i += 1) {
              s += '<li>' +
                'By <strong>' + post_list[i].user + '</strong>' +
                ' - <time datetime="' + post_list[i].date + '" title="' + moment(post_list[i].date).format('LLLL') + '">' + moment(post_list[i].date).fromNow() + '</time><br/>';
              if (post_list[i].attachment_link !== null && result_list[i] !== null) {
                post_list[i].attachment_link = result_list[i];
              }
              if (post_list[i].text) {
                plain_content = post_list[i].text;
                if (post_list[i].attachment_link) {
                  s += plain_content + '<strong>Attachment: </strong>' +
                    '<a href=\"' +
                    post_list[i].attachment_link + '\">' + post_list[i].attachment_name +
                    '</a>';
                } else {
                  s += plain_content;
                }
              } else {
                if (post_list[i].attachment_link) {
                  s += '<strong>Attachment: </strong>' + '<a href=\"' +
                    post_list[i].attachment_link + '\">' + post_list[i].attachment_name +
                    '</a>';
                }
              }
              s += '<hr id=post_item>';  // XXX XSS attack!
            }
            comments.innerHTML = s;
          } else {
            comments.innerHTML = "<p><em>No comment yet.</em></p><hr id=post_item>";
          }
        });
    })
    .declareJob('submitPostComment', function () {
      var gadget = this,
        submitButton = null,
        queue = null,
        editor = null;
      return gadget.getDeclaredGadget("editor")
        .push(function (e) {
          editor = e;
          return e.getContent();
        })
        .push(function (content) {
          if (content.comment === '') {
            return gadget.notifySubmitted({message: "Post content can not be empty!"});
          }

          submitButton = gadget.element.querySelector("input[type=submit]");
          submitButton.disabled = true;
          function enableSubmitButton() {
            submitButton.disabled = false;
          }
          queue = gadget.notifySubmitted({message: "Posting comment"})
            .push(function () {
              var choose_file_html_element = gadget.element.querySelector('#attachment'),
                file_blob = choose_file_html_element.files[0],
                url = gadget.hateoas_url + "post_module/PostModule_createHTMLPostForSupportRequest",
                data = new FormData();
              data.append("follow_up", gadget.options.jio_key);
              data.append("predecessor", '');
              data.append("data", content.comment);
              data.append("file", file_blob);
              // XXX: Hack, call jIO.util.ajax directly to pass the file blob
              // Because the jio_putAttachment will call readBlobAsText, which
              // will broke the binary file. Call the jIO.util.ajax directly
              // will not touch the blob
              return jIO.util.ajax({
                "type": "POST",
                "url": url,
                "data": data,
                "xhrFields": {
                  withCredentials: true
                }
              });
            })
            .push(function () {
              return gadget.notifySubmitted({message: "Comment added", status: "success"});
            })
            .push(function () {
              editor.changeState({value: ''})
                .push(function () {
                  return gadget.redirect({command: 'reload'});
                });
            });
          queue.push(enableSubmitButton, enableSubmitButton);
          return queue;
        });
    })
    .onEvent('submit', function () {
      this.submitPostComment();
    });
}(window, rJS, RSVP, calculatePageTitle, moment));