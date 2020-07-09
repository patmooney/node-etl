describe('index', function () {
    let libMock = {}, configMock = {}, exitHookMock, ClientMock, exitHookCb;
    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        configMock = {
            data: {
                source: {
                    cxn: 'the-source-cxn',
                    database: 'the-source-database'
                },
                target: {
                    cxn: 'the-target-cxn',
                    database: 'the-target-database'
                }
            },
            transform: 'the-transform'
        };
        exitHookMock = chai.spy((cb) => exitHookCb = cb);
        libMock = {
            copySchema: chai.spy(() => Promise.resolve('the-tmp-db')),
            cleanTempDb: chai.spy(() => Promise.resolve()),
            migrateData: chai.spy(() => Promise.resolve()),
            migrateTempDb: chai.spy(() => Promise.resolve())
        };
        ClientMock = chai.spy();
        ClientMock.prototype = {
            ...ClientMock.prototype,
            connect: chai.spy(() => Promise.resolve()),
            end: chai.spy(() => Promise.resolve())
        };
        mockery.registerMock('config', configMock);
        mockery.registerMock('./lib', libMock);
        mockery.registerMock('async-exit-hook', exitHookMock);
        mockery.registerMock('pg', { Client: ClientMock });
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
        mockery.disable();
    });

    it('should fail early', async function () {
        libMock.copySchema = chai.spy(() => Promise.reject('bad error'));
        const { run } = require('../../index');
        await expect(run()).to.eventually.rejectedWith('bad error');
        expect(libMock.copySchema).to.have.been.called.with(
            { cxn: 'the-source-cxn', database: 'the-source-database' },
            { cxn: 'the-target-cxn', database: 'the-target-database' }
        );
        expect(libMock.migrateData).to.not.have.been.called();
    });

    it('should clean up', async function () {
        libMock.migrateData = chai.spy(() => Promise.reject('another error'));
        const { run } = require('../../index');
        await expect(run()).to.eventually.rejectedWith('another error');
        expect(libMock.copySchema).to.have.been.called();
        expect(libMock.migrateData).to.have.been.called();
        expect(exitHookMock).to.have.been.called();

        await (new Promise(resolve => exitHookCb(resolve)));

        expect(libMock.cleanTempDb).to.have.been.called.with('the-target-cxn', 'the-tmp-db');
        expect(ClientMock.prototype.end).to.have.been.called.exactly(2);
    });

    it('should finish as expected', async function () {
        const { run } = require('../../index');
        await expect(run()).to.eventually.equal(undefined);
        expect(libMock.copySchema).to.have.been.called();
        expect(libMock.migrateData).to.have.been.called();
        expect(libMock.cleanTempDb).to.not.have.been.called();
        expect(libMock.migrateTempDb).to.have.been.called.with(
            'the-target-cxn', 'the-tmp-db', 'the-target-database'
        );
    });
});
