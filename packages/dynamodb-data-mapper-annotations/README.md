# Amazon DynamoDB DataMapper Annotations

[![Apache 2 License](https://img.shields.io/github/license/awslabs/dynamodb-data-mapper-js.svg?style=flat)](http://aws.amazon.com/apache-2-0/)

This library provides annotations to allow easy integration of domain classes
with the `DataMapper` defined in `@aws/dynamodb-data-mapper`. These annotations
are provided in a separate NPM package because they rely on two experimental
features of TypeScript (decorators and metadata decoration) and depend on the
`reflect-metadata` package.

## Getting started

To use the annotations, you will first need to enable two TypeScript compiler
settings: `experimentalDecorators` and `emitDecoratorMetadata`. The former
enables the use of annotations in your project, and the latter emits type
information about declared property classes.

Next, start adding `table` annotations to the domain models that represent
records in your DynamoDB tables and `attribute` annotations to the declared
properties that map to attributes of those records:

```typescript
import {attribute, table} from '@aws/dynamodb-data-mapper-annotations';
import uuidV4 = require('uuid/v4');

@table('my_table')
class MyDomainClass {
    @attribute({
        keyType: 'HASH',
        defaultProvider: uuidV4
    })
    id: string;

    @attribute({
        keyType: 'RANGE',
        defaultProvider: () => new Date()
    })
    createdAt: Date;

    @attribute()
    toggle?: boolean;

    @attribute({memberType: 'String'})
    tags?: Set<string>;
    
    // This property will not be saved to DynamoDB.
    notPersistedToDynamoDb: string;
}
```

Using these annotations will automatically define properties at the
`DynamoDbSchema` and `DynamoDbTable` symbols on the class prototype, meaning
that you can pass instances of the class directly to a `DataMapper` instance. No
need to define a schema separately; your class's property type declarations are
the schema.

To declare a class corresponding to a map attribute value in a DynamoDB record,
simply omit the `table` annotation:

```typescript
import {attribute, table} from '@aws/dynamodb-data-mapper-annotations';
import {embed} from '@aws/dynamodb-data-mapper';

class Comment {
    @attribute()
    author?: string;

    @attribute()
    postedAt?: Date;

    @attribute()
    text?: string;
}

@table('posts')
class BlogPost {
    @attribute({keyType: 'HASH'})
    id: string;

    @attribute()
    author?: string;

    @attribute()
    postedAt?: Date;

    @attribute()
    text?: string;
    
    @attribute({memberType: embed(Comment)})
    replies?: Array<Comment>
}
```

## Caveats

### Reliance on experimental TypeScript features

Because this package relies on experimental TypeScript features, it is subject
to change and should be considered beta software. Decorators are currently on
the ECMAScript standards track, but the accepted form may differ from that
implemented by TypeScript, which could cause the public interface presented by
this project to change.

### Lack of type information in generics

Please note that TypeScript does not emit any metadata about the type parameters
supplied to generic types, so `Array<string>`, `[number, string]`, and 
`MyClass[]` are all exposed as `Array` via the emitted metadata. Without
additional metadata, this annotation will treat all encountered arrays as
collections of untyped data. You may supply either a `members` declaration or a
`memberType` declaration to direct this annotation to treat a property as a
tuple or typed list, respectively.

Member type declarations are required for maps and sets, though the member type
will be automatically inferred if a property is declared as being of type
`BinarySet` or `NumberValueSet` (from the `@aws/dynamodb-auto-marshaller`
package).