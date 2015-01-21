import api from './api';

var Block = {
  _inherits: function (field) {
    if ('_inherits' in field) {
      return [field._inherits];
    } else {
      return [];
    }
  },

  _components: function (field) {
    if ('_components' in field) {
      return [field._components];
    } else {
      return [];
    }
  },

  _pathOf: function (field) {
    if (field.indexOf(':') > -1) {
      return field.split(':')[1];
    } else {
      return field;
    }
  },

  _separatePath: function (field) {
    return field.split('.');
  },

  _componentName: function (field) {
    return Block._separatePath(Block._pathOf(field)).pop();
  },

  _resolve: function (hierarchy, block) {
    var remaining_path = hierarchy.slice(0);
    var field = block.schema;
    while (remaining_path[0] in field) {
      field = field[remaining_path[0]];
      remaining_path = remaining_path.slice(1);
    }

    if (remaining_path.length === 0) {
      return hierarchy;
    }

    var ret = '';
    Block._inherits(field).forEach(function (inheritance) {
      var result = Block._resolve(([inheritance].concat(remaining_path)).join('.'), block);
      if (result) { ret = result; }
    });
    if (ret !== '') { return ret; }

    Block._components(field).filter(function (component) {
      return Block._componentName(component) === remaining_path[0];
    }).forEach(function (component) {
      ret = Block._resolve([component].concat(remaining_path.slice(1)).join('.'), block);
    });

    return ret;
  },

  _resolveField: function (hierarchy, block) {
    return Block._resolve(hierarchy, block).reduce(function (obj, key) {
      return obj[key];
    }, block.schema);
  },

  _retrieveField: function (path, block, cb) {
    var field = Block._resolveField(path.hierarchy, block);

    var deferreds = [];

    if (field._components) {
      field._components.map(Block.getPathForIdentifier).forEach(function (componentPath) {
        var deferred = new $.Deferred();
        deferreds.push(deferred);

        Block._retrieveFieldFromPath(componentPath, function (f) {
          field[componentPath.hierarchy.pop()] = f;
          deferred.resolve();
        });
      });
    }

    if (field._inherits) {
      var componentPath = Block.getPathForIdentifier(field._inherits);
      field._inherits = componentPath.identifier;

      var deferred = new $.Deferred();
      deferreds.push(deferred);

      Block._retrieveFieldFromPath(componentPath, function (f) {
        field = $.extend(f, field);

        f._assigns = f._assigns || [];
        f._assigns.push(path.identifier);

        deferred.resolve();
      });
    }

    $.when.apply($, deferreds).done(function () {
      delete field._components;
      cb(field);
    });
  },

  getPathForIdentifier: function (identifier) {
    identifier = (identifier.indexOf(':') < 0) ? Slide.DEFAULT_ORGANIZATION + ':' + identifier : identifier;
    var deconstructed = identifier.split(':');
    return {
      organization: deconstructed[0],
      hierarchy: deconstructed[1].split('.'),
      identifier: identifier
    };
  },

  _retrieveBlock: function (path, cb) {
    if (Slide.CACHED_BLOCKS[path.organization]) {
      cb(Slide.CACHED_BLOCKS[path.organization]);
    } else {
      api.get('/blocks', {
        data: { organization: path.organization },
        success: function (block) {
          cb(block);
        }
      });
    }
  },

  deconstructField: function (field) {
    var children = {},
        annotations = {};

    for (var key in field) {
      if (field.hasOwnProperty(key)) {
        if (key[0] === '_') {
          annotations[key] = field[key];
        } else {
          children[key] = field[key];
        }
      }
    }

    return { children: children, annotations: annotations };
  },

  getChildren: function (field) {
    return Block.deconstructField(field).children;
  },

  getAnnotations: function (field) {
    return Block.deconstructField(field).annotations;
  },

  _retrieveFieldFromPath: function (path, cb) {
    Block._retrieveBlock(path, function (block) {
      Block._retrieveField(path, block, function (field) {
        cb(field);
      });
    });
  },

  getFieldsForIdentifiers: function (identifiers, cb) {
    var fields = {},
        deferreds = [],
        paths = identifiers.map(Block.getPathForIdentifier);

    paths.map(function (path) {
      var deferred = new $.Deferred();
      deferreds.push(deferred);
      Block._retrieveFieldFromPath(path, function (field) {
        fields[path.identifier] = field;
        deferred.resolve();
      });
    });

    $.when.apply($, deferreds).done(function () {
      cb(fields);
    });
  }
};

export default Block;
