function Interface_ (name='', params={}) {
  class I_ {
    constructor (n, p) {
      this.name = `Dotmitizer.${n}`;
      this.params = p;
    }
    
    get req() {
      throw Error(`Missing at least one required parameter for ${this.name}: ${Object.keys(this.params)}`);
    }
    
    extra(kwargs) {
      if (Object.entries(kwargs).length > 0) 
        throw Error(`Extra parameters passed to ${this.name}: ${Object.entries(kwargs)}`);
    }
    
    typecheck(args) {
      // arguments is an object-like array, need to flatten it so that we represent it as viewed from function scope
      let argObj = {};
      for (const prop in args) {
        argObj = {...argObj, ...args[prop]};
      }
      
      // now that both have matching types, let's go
      for (const prop in this.params) {
        if (this.params[prop] === 'any') continue;  // type of 'any' special meaning is to skip it
        if (this.params[prop] === 'array') {
          if (!Array.isArray(argObj[prop])) throw new Error(`Type mismatch in ${this.name}: "${prop}". Expected array but got ${typeof(argObj)}`);
        } else if (typeof(argObj[prop]) !== this.params[prop]) {
          throw new Error(`Type mismatch in ${this.name}: "${prop}". Expected ${typeof(this.params[prop])} but got ${typeof(argObj)}`);
        }
      }
    }
  }
  return new I_(name, params);
}


const MoveI = Interface_('move', {sourcePath: 'string', destPath: 'string', obj: 'object'});
const CopyI = Interface_('copy', {sourceObject: 'object', sourcePath: 'string', destObject: 'object', destPath: 'string'});
const TransferI = Interface_('transfer', {sourcePath: 'string', destPath: 'string', source: 'object', target: 'object'});
const ExpandI = Interface_('expand', {obj: 'object'});
const GetI = Interface_('get', {path: 'string', obj: 'object'});
const SetI = Interface_('set', {path: 'string', obj: 'object', value: 'any'});
const DeleteI = Interface_('delete_', {path: 'string', obj: 'object'});
const RemoveI = Interface_('remove', {path: 'string', obj: 'object'});
const TransformI = Interface_('transform', {recipe: 'object', source: 'object'});
const DotI = Interface_('dot', {obj: 'object'});
const JsonsI = Interface_('jsons', {jsons: 'array'});


class Dotmitizer {
    
  static move ({sourcePath=MoveI.req, destPath=MoveI.req, obj=MoveI.req, ...kwargs}={}) {
    MoveI.extra(kwargs);
    MoveI.typecheck(arguments);
    return DotObject.move(sourcePath, destPath, obj);
  }
  
  static copy ({sourceObject=CopyI.req, sourcePath=CopyI.req, destObject=CopyI.req, destPath=CopyI.req, ...kwargs}={}) {
    CopyI.extra(kwargs);
    CopyI.typecheck(arguments);
    return DotObject.copy(sourcePath, destPath, sourceObject, destObject);
  }
  
  static transfer ({sourcePath=TransferI.req, destPath=TransferI.req, source=TransferI.req, target=TransferI.req, ...kwargs}={}) {
    TransferI.extra(kwargs);
    TransferI.typecheck(arguments);
    return DotObject.transfer(sourcePath, destPath, source, target);
  }
  
  static expand ({obj=ExpandI.req, ...kwargs}={}) {
    ExpandI.extra(kwargs);
    ExpandI.typecheck(arguments);
    return DotObject.object(obj);
  }
  
  static get ({path=GetI.req, obj=GetI.req, ...kwargs}={}) {
    GetI.extra(kwargs);
    GetI.typecheck(arguments);
    return DotObject.pick(path, obj);
  }
  
  static set ({path=SetI.req, value=SetI.req, obj=SetI.req, ...kwargs}={}) {
    SetI.extra(kwargs);
    SetI.typecheck(arguments);
    return DotObject.str(path, value, obj);
  }
  
  static delete_ ({path, obj, ...kwargs}={}) {
    DeleteI.extra(kwargs);
    DeleteI.typecheck(arguments);
    return DotObject.delete(path, obj);
  }
  
  static remove ({path=RemoveI.req, obj=RemoveI.req, ...kwargs}={}) {
    RemoveI.extra(kwargs);
    RemoveI.typecheck(arguments);
    return DotObject.remove(path, obj);
  }
  
  static transform ({recipe=TransformI.req, source=TransformI.req, ...kwargs}={}) {
    TransformI.extra(kwargs);
    TransformI.typecheck(arguments);
    return DotObject.transform(recipe, source);
  }
  
  static dot ({obj=DotI.req, ...kwargs}={}) {
    DotI.extra(kwargs);
    DotI.typecheck(arguments);
    return DotObject.dot(obj);
  }
  
  static jsonsTo2dArray ({jsons=JsonsI.req, ...kwargs}={}) {
    JsonsI.extra(kwargs);
    JsonsI.typecheck(arguments);
    const headers = [];
    const values = [];
    for (const json of jsons) {
      const value = DotObject.dot(json);
      headers.push(Object.keys(value));
      values.push(value);
    }
    const row1 = [...new Set([].concat(...headers))];
    row1.sort();
    const rows = values.map(value => row1.map(column => value[column] || null));
    return [row1, ...rows];
  }

}
